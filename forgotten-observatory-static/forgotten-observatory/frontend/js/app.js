import { comparePositions, gnomonShadowLength } from "./engine/astronomy.js";
import { reconstructLongitude } from "./engine/reconstruction.js";
import { buildResidualRows } from "./engine/dataset.js";

const $ = id => document.getElementById(id);
// Empty input -> NaN, so it fails validation instead of silently becoming 0
const num = id => { const v = $(id).value.trim(); return v === "" ? NaN : Number(v); };

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[c]);
}

function showError(element, message) {
    element.innerHTML = `
        <div class="result-details">
            <strong style="color: var(--danger)">Calculation error</strong>
            <br>${escapeHTML(message)}
        </div>`;
}

// Wire a button: run compute(), render the HTML it returns, show errors in place.
function bind(buttonId, outputId, compute) {
    $(buttonId).addEventListener("click", () => {
        const out = $(outputId);
        try { out.innerHTML = compute(); } catch (error) { showError(out, error.message); }
    });
}

bind("reconstructButton", "reconstructionResult", () => {
    const r = reconstructLongitude(
        num("initialLongitude"), num("meanMotion"),
        $("referenceDate").value, $("targetDate").value
    );
    return `
        <div>
            <div class="result-value">${r.reconstructed_longitude_deg.toFixed(6)}°</div>
            <div class="result-details">
                Reference date: ${escapeHTML(r.reference_date)}<br>
                Target date: ${escapeHTML(r.target_date)}<br>
                Elapsed days: ${r.elapsed_days}<br>
                Mean motion: ${r.mean_motion_deg_per_day}°/day<br>
                Model: ${escapeHTML(r.model)}
            </div>
        </div>`;
});

bind("compareButton", "comparisonResult", () => {
    const r = comparePositions(
        num("historical"), num("modern"), 0, 0, $("conventionsMatched").checked
    );
    return `
        <div>
            <div class="result-value">${r.absolute_difference_deg.toFixed(6)}°</div>
            <div class="result-details">
                Signed difference: ${r.signed_difference_deg.toFixed(6)}°<br>
                Combined uncertainty: ${r.combined_uncertainty_deg.toFixed(6)}°<br>
                Status: ${escapeHTML(r.comparison_status)}
            </div>
        </div>`;
});

bind("gnomonButton", "gnomonResult", () => {
    const height = num("gnomonHeight");
    const altitude = num("solarAltitude");
    const shadow = gnomonShadowLength(height, altitude);
    updateShadowVisual(shadow, height);
    return `
        <div>
            <div class="result-value">${shadow.toFixed(4)} m</div>
            <div class="result-details">
                Gnomon height: ${height} m<br>
                Solar altitude: ${altitude}°
            </div>
        </div>`;
});

function updateShadowVisual(shadowLength, height) {
    const width = Math.min(75, Math.max(5, (shadowLength / height) * 20));
    document.querySelector(".shadow-line").style.width = `${width}%`;
}

// ---- Published 1869 dataset: residual table + loader for the comparison form ----

const signed = (x, digits) => `${x < 0 ? "\u2212" : "+"}${Math.abs(x).toFixed(digits)}`;

async function loadDataset() {
    const table = $("datasetTable");
    try {
        const response = await fetch("data/published_epoch_1869.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const dataset = await response.json();
        const rows = buildResidualRows(dataset);

        $("datasetMeta").innerHTML =
            `${escapeHTML(dataset.reference)} \u00b7 Source: ${escapeHTML(dataset.source.author)}, ` +
            `${escapeHTML(dataset.source.table_location)} \u00b7 Status: ${escapeHTML(dataset.status)}`;
        $("datasetWarning").textContent =
            `${dataset.coordinate_warning} Differences are between two published values, not a verified accuracy measurement.`;

        table.innerHTML = `
            <table class="data-table">
                <thead><tr>
                    <th>Body</th>
                    <th class="num">Siddhanta Darpana</th>
                    <th class="num">Published modern</th>
                    <th class="num">Difference (\u2032)</th>
                    <th class="num">Difference (\u00b0)</th>
                </tr></thead>
                <tbody>${rows.map((r, i) => `
                    <tr data-index="${i}" tabindex="0">
                        <td>${escapeHTML(r.body)}</td>
                        <td class="num">${escapeHTML(r.siddhanta_dms)}</td>
                        <td class="num">${escapeHTML(r.modern_dms)}</td>
                        <td class="num diff">${signed(r.difference_arcmin, 1)}</td>
                        <td class="num">${signed(r.difference_deg, 4)}</td>
                    </tr>`).join("")}
                </tbody>
            </table>`;

        const select = $("datasetBody");
        rows.forEach((r, i) => select.add(new Option(r.body, i)));

        const pick = index => {
            const r = rows[index];
            if (!r) return;
            $("historical").value = Number(r.siddhanta_deg.toFixed(6));
            $("modern").value = Number(r.modern_deg.toFixed(6));
            select.value = index;
            $("compareButton").click();
        };
        select.addEventListener("change", () => pick(select.value));
        table.addEventListener("click", e => { const tr = e.target.closest("tr[data-index]"); if (tr) pick(tr.dataset.index); });
        table.addEventListener("keydown", e => {
            const tr = e.target.closest("tr[data-index]");
            if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(tr.dataset.index); }
        });
    } catch (error) {
        table.innerHTML = "";
        $("datasetMeta").textContent =
            `Could not load the dataset (${error.message}). Serve the site over http, for example: npx serve frontend`;
    }
}

loadDataset();

document.addEventListener("DOMContentLoaded", () => $("gnomonButton").click());

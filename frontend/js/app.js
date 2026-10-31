const API_BASE = "http://127.0.0.1:8000";


async function apiRequest(endpoint, data = null) {

    const options = {
        method: data ? "POST" : "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        options
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.detail || "API request failed."
        );
    }

    return result;
}


function displayError(element, message) {

    element.innerHTML = `
        <div class="result-details">
            <strong style="color: var(--danger)">
                Calculation error
            </strong>
            <br>
            ${escapeHTML(message)}
        </div>
    `;
}


function escapeHTML(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );
}


function displayReconstruction(result) {

    const element = document.getElementById(
        "reconstructionResult"
    );

    element.innerHTML = `
        <div>
            <div class="result-value">
                ${result.reconstructed_longitude_deg.toFixed(6)}°
            </div>

            <div class="result-details">
                Reference date:
                ${escapeHTML(result.reference_date)}
                <br>

                Target date:
                ${escapeHTML(result.target_date)}
                <br>

                Elapsed days:
                ${result.elapsed_days}
                <br>

                Mean motion:
                ${result.mean_motion_deg_per_day}°/day
                <br>

                Model:
                ${escapeHTML(result.model)}
            </div>
        </div>
    `;
}


document.getElementById(
    "reconstructButton"
).addEventListener("click", async () => {

    const resultElement = document.getElementById(
        "reconstructionResult"
    );

    const payload = {

        initial_longitude_deg: Number(
            document.getElementById("initialLongitude").value
        ),

        mean_motion_deg_per_day: Number(
            document.getElementById("meanMotion").value
        ),

        reference_date: document.getElementById(
            "referenceDate"
        ).value,

        target_date: document.getElementById(
            "targetDate"
        ).value

    };

    try {

        const result = await apiRequest(
            "/api/reconstruct",
            payload
        );

        displayReconstruction(result);

    } catch (error) {

        displayError(
            resultElement,
            error.message
        );

    }

});


document.getElementById(
    "compareButton"
).addEventListener("click", async () => {

    const resultElement = document.getElementById(
        "comparisonResult"
    );

    const payload = {

        historical_longitude: Number(
            document.getElementById("historical").value
        ),

        modern_longitude: Number(
            document.getElementById("modern").value
        ),

        historical_uncertainty: 0,

        modern_uncertainty: 0,

        conventions_matched: document.getElementById(
            "conventionsMatched"
        ).checked

    };

    try {

        const result = await apiRequest(
            "/api/compare",
            payload
        );

        resultElement.innerHTML = `
            <div>
                <div class="result-value">
                    ${result.absolute_difference_deg.toFixed(6)}°
                </div>

                <div class="result-details">
                    Signed difference:
                    ${result.signed_difference_deg.toFixed(6)}°
                    <br>

                    Combined uncertainty:
                    ${result.combined_uncertainty_deg.toFixed(6)}°
                    <br>

                    Status:
                    ${escapeHTML(result.comparison_status)}
                </div>
            </div>
        `;

    } catch (error) {

        displayError(
            resultElement,
            error.message
        );

    }

});


document.getElementById(
    "gnomonButton"
).addEventListener("click", async () => {

    const resultElement = document.getElementById(
        "gnomonResult"
    );

    const height = Number(
        document.getElementById("gnomonHeight").value
    );

    const altitude = Number(
        document.getElementById("solarAltitude").value
    );

    try {

        const result = await apiRequest(
            "/api/gnomon",
            {
                height_m: height,
                solar_altitude_deg: altitude
            }
        );

        resultElement.innerHTML = `
            <div>
                <div class="result-value">
                    ${result.shadow_length_m.toFixed(4)} m
                </div>

                <div class="result-details">
                    Gnomon height: ${result.height_m} m
                    <br>
                    Solar altitude:
                    ${result.solar_altitude_deg}°
                </div>
            </div>
        `;

        updateShadowVisual(
            result.shadow_length_m,
            height
        );

    } catch (error) {

        displayError(
            resultElement,
            error.message
        );

    }

});


function updateShadowVisual(shadowLength, height) {

    const line = document.querySelector(
        ".shadow-line"
    );

    const ratio = shadowLength / height;

    const width = Math.min(
        75,
        Math.max(5, ratio * 20)
    );

    line.style.width = `${width}%`;

}


document.addEventListener("DOMContentLoaded", () => {

    document.getElementById(
        "gnomonButton"
    ).click();

});
const map = document.querySelector("svg");
const regions = document.querySelectorAll("path");
const sawahElements = document.querySelectorAll(".sawah");
const sidePanel = document.querySelector(".side-panel");
const infoContainer = document.querySelector(".side-panel .container");
const closeButton = document.querySelector(".close-btn");
const loadingMessage = document.querySelector(".loading");
const zoomInButton = document.querySelector(".zoom-in");
const zoomOutButton = document.querySelector(".zoom-out");
const zoomValueDisplay = document.querySelector(".zoom-value");
const regionNameDisplay = document.querySelector(".name");
const rwNumberDisplay = document.querySelector(".number");
const rwHeadDisplay = document.querySelector(".head");
const UMKMcategory = document.querySelector(".category");
const UMKMowner = document.querySelector(".owner");

let regionData = {};
let umkmData = {};

// Automatically load Excel data
const loadExcelData = async (filePath) => {
    try {
        console.log(`Loading Excel file from: ${filePath}`);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${filePath}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
            throw new Error("No sheet found in the Excel file.");
        }
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`Loaded data from ${filePath}:`, data);
        return data;
    } catch (error) {
        console.error(`Error loading Excel file (${filePath}):`, error);
        return [];
    }
};

loadExcelData('./DataRW.xlsx')
    .then(data => console.log("Data RW Loaded:", data))
    .catch(err => console.error("Failed to load DataRW.xlsx:", err));

loadExcelData('./DataUMKM.xlsx')
    .then(data => console.log("Data UMKM Loaded:", data))
    .catch(err => console.error("Failed to load DataUMKM.xlsx:", err));

const loadAndSyncData = async () => {
    try {
        // Load data from Excel files
        const rwData = await loadExcelData('./DataRW.xlsx');
        const umkmDataRaw = await loadExcelData('./DataUMKM.xlsx');

        // Populate regionData using Nomor RW
        rwData.forEach((rw) => {
            if (rw["Nomor RW"]) {
                const rwNumberDisplay = rw["Nomor RW"];
                regionData[rwNumberDisplay] = {
                    name: rw["Nama RW"] || "-",
                    number: rwNumberDisplay,
                    head: rw["Kepala RW"] || "Tidak Diketahui",
                    umkm: [],
                };
            }
        });

        // Map UMKM data to respective regions using Nomor RW
        umkmDataRaw.forEach((umkm) => {
            if (umkm["Nomor RW"]) {
                const rwNumberDisplay = umkm["Nomor RW"];
                if (regionData[rwNumberDisplay]) {
                    regionData[rwNumberDisplay].umkm.push({
                        owner: umkm["Pemilik UMKM"] || "Tidak Diketahui",
                        category: umkm["Jenis UMKM"] || "Tidak Diketahui",
                    });
                }
            }
        });

        console.log("Data synchronized successfully using Nomor RW:", regionData);
    } catch (error) {
        console.error("Error synchronizing data:", error);
    }
};

// Call the function to load and sync data
loadAndSyncData();


// Event listeners for map interactions
regions.forEach((region) => {
    // Click event for loading data
    region.addEventListener("click", function (e) {
        // Show loading message
        loadingMessage.innerText = "Loading...";
        infoContainer.classList.add("hide");
        loadingMessage.classList.remove("hide");
        sidePanel.classList.add("side-panel-open");

        // Get the clicked region's RW number
        const clickedRegionNumber = e.target.getAttribute("number") || e.target.classList.value;
        if (!clickedRegionNumber) {
            loadingMessage.innerText = "No Data Available for Selected Region";
            return;
        }

        // Retrieve region data
        const data = regionData[clickedRegionNumber];
        if (!data) {
            console.error(`No data found for region: ${clickedRegionNumber}`);
            loadingMessage.innerText = "No Data Available for Selected Region";
            return;
        }

        // Render data to the sidebar
        setTimeout(() => {
            regionNameDisplay.innerText = data.name;
            rwNumberDisplay.innerText = `${data.number}`;
            rwHeadDisplay.innerText = `${data.head}`;

            // Display UMKM data
            const umkmList = data.umkm.map(
                (umkm) =>
                    `<li><strong>${umkm.owner}</strong> (${umkm.category})</li>`
            ).join("");

            const umkmContainer = document.querySelector(".umkm-list");
            umkmContainer.innerHTML = umkmList.length > 0 ? umkmList : "<li>Tidak ada data UMKM</li>";

            // Hide loading message and show the container
            infoContainer.classList.remove("hide");
            loadingMessage.classList.add("hide");
        }, 500);
    });

    // Hover effects for regions
    region.addEventListener("mouseenter", function () {
        const classList = [...this.classList].join('.');
        console.log(`Hovered region class list: ${classList}`);
        const selector = '.' + classList;
        const matchingElements = document.querySelectorAll(selector);

        // Apply hover styles
        matchingElements.forEach(el => el.style.fill = "#c99aff");
        matchingElements.forEach(el => el.style.fill = "#e92021");
    });

    region.addEventListener("mouseout", function () {
        const classList = [...this.classList].join('.');
        const selector = '.' + classList;
        const matchingElements = document.querySelectorAll(selector);

        // Reset styles on hover out
        matchingElements.forEach(el => el.style.fill = "#443d4b");
        matchingElements.forEach(el => el.style.fill = "#1a1a1a");
    });
});


// Close panel
closeButton.addEventListener("click", () => {
    sidePanel.classList.remove("side-panel-open");
});

// Zoom controls
let zoomLevel = 100;
zoomOutButton.disabled = true;

zoomInButton.addEventListener("click", () => {
    zoomOutButton.disabled = false;
    zoomLevel += 100;
    if (zoomLevel >= 500) zoomInButton.disabled = true;
    map.style.width = zoomLevel + "vw";
    map.style.height = zoomLevel + "vh";
    zoomValueDisplay.innerText = zoomLevel + "%";
});

zoomOutButton.addEventListener("click", () => {
    zoomInButton.disabled = false;
    zoomLevel -= 100;
    if (zoomLevel <= 100) zoomOutButton.disabled = true;
    map.style.width = zoomLevel + "vw";
    map.style.height = zoomLevel + "vh";
    zoomValueDisplay.innerText = zoomLevel + "%";
});

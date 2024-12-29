const map = document.querySelector("svg");
const countries = document.querySelectorAll("path");
const sidePanel = document.querySelector(".side-panel");
const container = document.querySelector(".side-panel .container");
const closeBtn = document.querySelector(".close-btn");
const loading = document.querySelector(".loading");
const zoomInBtn = document.querySelector(".zoom-in");
const zoomOutBtn = document.querySelector(".zoom-out");
const zoomValueOutput = document.querySelector(".zoom-value");
const countryNameOutput = document.querySelector(".country-name");
const countryFlagOutput = document.querySelector(".country-flag");
const cityOutput = document.querySelector(".city");
const areaOutput = document.querySelector(".area");
const currencyOutput = document.querySelector(".currency");
const LanguagesOutput = document.querySelector(".languages");

countries.forEach(country => {
	country.addEventListener("mouseenter", function() {
		const classList = [...this.classList].join('.');
		console.log(classList);
		const selector = '.' + classList;
		const matchingElements = document.querySelectorAll(selector);
		matchingElements.forEach(el => el.style.fill = "#e92021");
	});
	country.addEventListener("mouseout", function () {
		const classList = [...this.classList].join('.');
		const selector = '.' + classList;
		const matchingElements = document.querySelectorAll(selector);
		matchingElements.forEach(el => el.style.fill = "#1a1a1a")
	});
	country.addEventListener("click", function(e) {
		loading.innerText = "Loading...";
		container.classList.add("hide");
		loading.classList.remove("hide");
		let clickedCountryName;
		if (e.target.hasAttribute("name")) {
			clickedCountryName = e.target.getAttribute("name");
		} else {
			clickedCountryName = e.target.classList.value;
		}
		sidePanel.classList.add("side-panel-open");
		fetch(`https://restcountries.com/v3.1/name/${clickedCountryName}?fullText=true`).then(response => {
			if (!response.ok) {
				throw new Error('Network Response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
			setTimeout(() => {
				countryNameOutput.innerText = data[0].name.common;
				countryFlagOutput.src = data[0].flags.png;
				cityOutput.innerText = data[0].capital;
				const formatedNumber = data[0].area.toLocaleString('de-DE');
				areaOutput.innerHTML = formatedNumber + `km<sup>2</sup>`;
				const currencies = data[0].currencies;
				currencyOutput.innerText = "";
				Object.keys(currencies).forEach(key => {
					currencyOutput.innerHTML += `<li>${currencies[key].name}</li>`
				});
				const languages = data[0].languages;
				LanguagesOutput.innerText = "";
				Object.keys(languages).forEach(key => {
					LanguagesOutput.innerHTML += `<li>${languages[key]}</li>`
				});
				countryFlagOutput.onload = () => {
					container.classList.remove("hide");
					loading.classList.add("hide");
				};
			}, 500);
		})
		.catch(error=> {
			loading.innerText = "No Data to Show for Selected Country";
			console.error("There was a problem with the fetch operation:", error);
		});
	});
});

closeBtn.addEventListener("click", () => {
	sidePanel.classList.remove("side-panel-open");
});

let zoomValue = 100;
zoomOutBtn.disabled = true;
zoomInBtn.addEventListener("click", () => {
	zoomOutBtn.disabled = false;
	zoomValue += 100;
	if (zoomValue < 500) {
		zoomInBtn.disabled = false;
	} else {
		zoomInBtn.disabled = true;
	}
	map.style.width = zoomValue + "vw";
	map.style.height = zoomValue + "vh";
	zoomValueOutput.innerText = zoomValue + "%";
});

zoomOutBtn.addEventListener("click", () => {
	zoomInBtn.disabled = false;
	zoomValue -= 100;
	if (zoomValue > 100) {
		zoomOutBtn.disabled = false;
	} else {
		zoomOutBtn.disabled = true;
	}
	map.style.width = zoomValue + "vw";
	map.style.height = zoomValue + "vh";
	zoomValueOutput.innerText = zoomValue + "%";
});
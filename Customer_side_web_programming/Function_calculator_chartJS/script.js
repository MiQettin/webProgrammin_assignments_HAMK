//Kooodi tehty tarkoituksella suoraan sellaiseksi, että myös y-scale on käytössä, jotta manuaalinen hallintakin onnistuu
//Made by: Mirka Romppanen Date: 13/03/25

document.addEventListener("DOMContentLoaded", function () {
    const math = window.math;
    const Chart = window.Chart;

    let myChart;
    let calculatedXY = { x: [], y: [] }; //Luodaan objekti x ja y tallentamista varten -> array
    let yScale; //Todellisuudessa tarpeeton kun käytössä chart.js
    let functionString;
    let xStart, xEnd, xStep;
    let results = ""; //Alustetaan tyhjäksi
    let parsedFunction;

    //Nappi event + luodaan wrapper funktio, jonka avulla hoidetaan koko ohjelman suoritus
    //Tarkistetaan form -> Onko hyvä ohjemlmointi tapa vai pitäisikö olla erillinen funktio? Lisätty erillinen
    document
        .querySelector("#form-container")
        .addEventListener("submit", function (event) {
            event.preventDefault();

            if (validateForm()) {
                //Jos lomake kunnossa -> Suoritetaan ohjelma
                setXYaxis(); //Luodaan x ja y akselit
                calculateGraph(); //Lasketaan ja piirretään kuvaaja
            }
        });
    //Tehty parselle kokonaan oma virheen takistus, en saanut toimimaan nestedinä jostain syystä monien yrityksien jälkeen :/
    function parseMathFunction() {
        try {

            functionString = document.getElementById("fx").value.trim();
            //Jos 1 char vain x, neperin luku tai numerot kelpaa. Yksittäinen kompleksi i jätetään pois -> ei voi käyttää itekseen funktion piirtoon (ei tee mitään)
            //if(functionString.length === 1 && functionString !== "x" && functionString !== "e") {
            //    return false; //Siirtyy suoraan catchiin
            //} -> Tehdään regex ja lisätään numerot -> Lyhyempi koodi
            if (functionString.length === 1 && !/^[0-9xe]$/.test(functionString)) {
                throw new Error("Only x, 0-9 or e (neper number are accepted as  a single char input.");
            }

            parsedFunction = math.compile(functionString);
            parsedFunction.evaluate({ x: 0 }); //Testataan onko funktio validi
            return true;
        } catch (error) {
            //Antaa syöttää esim. s kirjaimen pelkästään, eikä aiheuta virhettä -> lisää -> Jos 1 char -> vain x,e(neper),i (kompleksi) Yksittäinen ei pidä kelpaa tai numero
            // -> <br> korvattaan \n -> pre elementtiin kts. updateResults()
            results = "Error: Invalid function input. (Math. prefix isn´t needed).\n" +
                "Accepted input to function. For example: 2*x^2 + 3*sin(x) - 4\n" +
                "Arithmetic operators: +, -, *, /, %, ^\n" +
                "Trigonometric functions: sin(x), cos(x), tan(x), asin(x) etc.\n" +
                "Logarithmic functions: log(x), ln(x)\n" +
                "Exponential function: exp(x)\n" +
                "Square root: sqrt(x)\n" +
                "Absolute value: abs(x)\n" +
                "Constants: pi, e\n" +
                "Variables: x\n";
            createLinkElement();
            //"More information: <a href=https://mathjs.org/docs/expressions/syntax.html target=\"_blank\">Math.js Official documentation</a>";
            updateResults();
            return false;
        }
    }

    function validateForm() {
        results = ""; 
        document.getElementById("link-container").innerHTML = "";

        //Nappaa virheet ja tulosta ne resultsiin. throw ei pakollinen -> tarvitaan oman string syöttöön
        //Huom!!!! Taakesepäin liikkuvat funktiot eivät toimi! Matemaattisesti saattaisi olla hyödyllinen  esim. datan tarkastelussa
        //Ei toteuteta tässä -> ei vaatimuksena. jos käytät tätä data-analyyseihin TARKISTA!

        try {
            xStart = parseFloat(document.getElementById("start-range").value);
            xEnd = parseFloat(document.getElementById("end-range").value);
            xStep = parseFloat(document.getElementById("x-step").value);
            yScale = parseFloat(document.getElementById("y-scale").value);

            if (!parseMathFunction()) {
                return false;
            }
            //Tarkistetaan onko syötteet numeroita
            if (isNaN(xStart) || isNaN(xEnd) || isNaN(xStep) || isNaN(yScale)) {
                throw new Error("Error: Invalid input. Please enter a number.");
            }

            if (xStart >= xEnd) {
                throw new Error("Error: xStart must be less than xEnd");
                //Siirrytään suoraan catche lohkoon + string sinne. Ei tarvita return false tämän takia
            }
//TARKISTA VIELÄ NÄMÄ!
            if (xStep < 0.0001) { //ppienemppi kuin 0.0001 Rajoitetaan pienin loop -> infinite loop ehkäisy
                throw new Error("Error: xStep must be greater than 0.0001");
            }

        } catch (error) {
            //Syötetään try-catch error sisältö resultsiin
            results += `${error.message}`;
            updateResults();
            return false;
        }
        updateResults();
        return true;
    }

    function setXYaxis() {
        //Ajetaan validateForm tässä, jotta syötteet tarkistetaan aina ennen laskemista
        if (!validateForm()) {
            return false;
        }

        calculatedXY.x = [];
        calculatedXY.y = [];

        for (let x = xStart; x <= xEnd; x += xStep) {
            calculatedXY.x.push(x);
        }
        //Käydään map avulla x arvot, lasketaan niiden perusteella y-arvot ja tallennetaa
        calculatedXY.y = calculatedXY.x.map((x) => parsedFunction.evaluate({ x }));

    }

    function calculateGraph() {
        //Jos haluat jatkossa käyttää tätä mieti pyöristykset, muotoilut ym oikein desimaaleille, kökön näkönen, mutta vastaa esimerkkiä
        for (let i = 0; i < calculatedXY.x.length; i++) {
            results += `f(${calculatedXY.x[i]}): ${calculatedXY.y[i]}\n`; //Tulostus string html:nä > käytetään rivi vaihtoa <br> sijasta -> Results tulostetaan pre sisään
        }
        console.log(results); //Testikoodi
        updateResults();

        drawChart();
    }

    //Funktio kaavion piirtoon
    function drawChart() {
        let ctx = document.getElementById("drawChart").getContext("2d");
        const mobile = window.matchMedia("(max-width: 600px)").matches; //Mobiililaitteille skaalaus

        if (myChart) {
            myChart.destroy();
        } //Tuhotaan ensin vanha -> muuten virhe

        let yMin = Math.min(...calculatedXY.y); //Lasketaan y min
        let yMax = Math.max(...calculatedXY.y); //Lsketaaan y max

        //Luodaan uusi chart olio
        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: calculatedXY.x,
                datasets: [
                    {
                        label: "f(x) = " + functionString,
                        fill: false,
                        tension: 0.4, //Käyrän "pyöristys"
                        backgroundColor: "white",
                        borderColor: "grey",
                        data: calculatedXY.y,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: mobile ? false : true, //Mobiiliskaalausta varten -> mukautetaan korkeutta leveyden perusteella
                scales: {
                    y: {
                        beginAtZero: true, //Tämän avulla tehdään automaattinen y-akselin skaalaus                       
                    },
                    x: { beginAtZero: true }, //Tämän avulla tehdään automaattinen x-akselin skaalaus
                    //x: { beginAtZero: false, stepSize: xStep }, //Manuaalinen skaalaus x-akselille -> xStep
                },
            },
        });
    }
    //Luodaan funktio resultsille, muuten ladataan liian aikaisin ja = undefined -> Vaihda textContent -> XSS-turvallinen
    function updateResults() {
        //XSS-suojauksen varmistamiseksi käydään result läpi ja luodaan p elementti, jonka sisään teksti
        const resultsElement = document.getElementById("results");
        resultsElement.innerHTML = ""; //Tyhjennetään elementti

        const preElement = document.createElement("pre");
        preElement.textContent = results;

        resultsElement.appendChild(preElement); //Syötetään luotu pre elementti id-results elementin sisään

    }

    function createLinkElement() {
        //Oma funtio linkin syötölle pre elementin ulkopuolella
        const linkContainer = document.getElementById("link-container");
        linkContainer.innerHTML = "More information: <a href=https://mathjs.org/docs/expressions/syntax.html target=\"_blank\">Math.js Official documentation</a>";

    }
});

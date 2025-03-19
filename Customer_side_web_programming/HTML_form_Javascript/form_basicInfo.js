//https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event -> 
// https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation

document.addEventListener('DOMContentLoaded', function () { //Varmistaa, että HTML on täysin ladattu ja käynnistetty ennen skriptin suorittamista
    //Haetaan form elementti -> Kuunnellan, submit painallus kutsuu validate formin
    document.querySelector("#basicInfo").addEventListener("submit", validateForm); //Haetaan id:llä -> elementin käyttö hakisi vain ekan (ei hyvä)

    document.getElementById('name').addEventListener('input', function() {
        this.setCustomValidity('');
    }); //Asettaa custom validityn tyhjäksi, kun syöte tapahtuu -> Nimi voidaan syöttää ensin väärin sitten oikein.
    //Ehdottomasti parempi tapa ohjelman toimivuuden kannalta -> Selvitä vielä mikä yleinen käytätäntö

    function findGender() {
        let returnGender = null;

        for (const chosenGender of document.getElementsByName("gender")) { //for-> käydään läpi gender valinnat
            if (chosenGender.checked) { //checked -> onko valittu
                returnGender = chosenGender.value;
                break
            }
        } return returnGender;
    };

    function selectedHobbies() {
        const hobbies = [];
        for (let hobby of document.getElementsByName("hobbies")) {
            if (hobby.checked) {
                hobbies.push(hobby.value);
            }
        } return hobbies;
    }

    function findCountry() { //Muutettu open esimerkki kovakoodattu dynaamiseksi

        const countrySelect = document.getElementById("country-selector"); //Palauttaa nodelist -> pakko käyttää .options toimivuuden takaamiseksi
        if (!countrySelect) return null //Jos valintaa ei ole tehty -> Null / Ehkäistään virheet
        for (let country of countrySelect.options) {
            if (country.selected) {
                return country.text;
            }
        } return null;
    }

    function validateName() {
        const nameInput = document.getElementById('name');
        const nameValue = nameInput.value.trim();
        const pattern = /^[A-Za-zÅÄÖåäö]+([ '-][A-Za-zÅÄÖåäö]+)*$/;
    
        if (!pattern.test(nameValue)) {
            nameInput.setCustomValidity("First name and last name required. No special characters except apostrophe (') or hyphen (-).");
            return false;
        } else {
            nameInput.reportValidity();  // Varmistaa, että virheilmoitus katoaa
            return true;
        }
    }  

    function validateForm(event) {
        event.preventDefault();
        const result = [];

        if(!validateName()) {
            const resultElement = document.getElementById("id-result"); //Mother elementti, johon syötetään luotu p appendilla
            resultElement.innerHTML = ""; //Tyhjennetään elementti -> Turvallinen koska ei syöte dataa
            const errorMessageParagraph = document.createElement("p");
            resultElement.appendChild(errorMessageParagraph);
            return; //Estää lomakkeen lähetyksen
        } 

        const nameInput = document.getElementById('name').value.trim(); //trim -> poistaa tyhjät merkit
        result.push("Full name: " + nameInput); //Ei tarvitse tarkistaa kenttää, koska required html

        const password1 = document.getElementById('password').value;
        const password2 = document.getElementById('password-confirm').value;
        if (password1 !== password2) {
            //result += "Passwords do not match"; > Ei tarvita, koska return. Käytettään alla olevaa tapaa-.. Parempi
            const resultElement = document.getElementById("id-result"); //Mother elementti, johon syötetään luotu p appendilla
            resultElement.innerHTML = ""; //Tyhjennetään elementti -> Turvallinen koska ei syöte dataa
            const errorMessageParagraph = document.createElement("p");
            errorMessageParagraph.textContent = "Passwords do not match, please fill again";
            resultElement.appendChild(errorMessageParagraph);
            return; //Estää lomakkeen lähetyksen
        }

        const chosenGender = findGender();
        result.push("Gender: " + chosenGender); //Onko muuttujan lisääminen järkevä tapa?

        const chosenHobbies = selectedHobbies();

        if (chosenHobbies.length > 0) {
            result.push("Hobbies: " + chosenHobbies.join(", "));
        } //Jos ei valintaa -> Ei tulostusta

        const birthdate = document.getElementById('birthdate'); //!!!Lisää min max js päivämäärät!!!

        let dateMax = Date.now() //Tämän päivän päivämäärä -> Voisi olla pienempikin :D
        let dateMin = Date.now() - 1000 * 60 * 60 * 24 * 365 * 137; //110 vuotta -> Ei ota huomioon karkausvuosia! ~ 27 kpl
        birthdate.max = new Date(dateMax).toISOString().split("T")[0]; //T -> aika ja päivämäärä
        birthdate.min = new Date(dateMin).toISOString().split("T")[0]; //T -> aika ja päivämäärä

        if (birthdate) {
            result.push("Birthdate: " + document.getElementById("birthdate").value); //Oikeasti olisi järkeä muotoilla toisin
        } //else {
        //  result.push("Birthdate: "); Jätetään pois, ei ollut tehtävän annossa
        //}

        const height = document.getElementById('heightValue');
        if (height && height.checkValidity()) { //validointi html attribuuttien mukaan! Mutta onko tarpeen
            result.push("Height: " + document.getElementById("heightValue").value);
        } /*else {
            //errors.push("Please, enter correct height from 40 to 300 cm");
            result.push("Height: "); //Ei määritelty tehtävän annossa, jätetään pois
        } */

        const color = document.getElementById('color-selector').value;
        result.push("Favorite color: " + color);

        const country = findCountry();
        if (country) {
            result.push("Country: " + country);
        } else {
            result.push("Country: ");
        }

        const profession = document.getElementById('profession-input').value;
        if (profession) {
            result.push("Profession: " + profession);
        } /*else {
            result.push("Profession: "); Jätetään pois -> ei tehtävän annossa
        } */

        //Muuttujan muoto string -> Rivivaihtojen perusteella taulukko, jotta saadaan html rivivaihdot
        const message = document.getElementById('message-input') //Tallentaan muuttujaan html element
            .value.trim()
            .replace(/>/g, "&gt;")
            .replace(/</g, "&lt;")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/#/g, "&#035;")
            .replace(/\//g, "&lt;") //-> Estää URL injektiot
            .replace(/\$/g, "&#36;") // -> JS injektiot
            .replace(/;/g, "&#59;") // -> SQL injektiot
            ; //Jätetään rivivaihdot kun niitä tarvitaan array luontiin

        if (message) {
            const messageLines = message.split("\n"); //Taulukko -> split rivinvaihto
            result.push("Message: " + messageLines.join("\n")); //Taulukosta -> rivivaihtojen erottelu
        } else {
            result.push("Message: ");
        }

        //XSS-suojauksen varmistamiseksi käydään result läpi ja luodaan jokaiselle rivillw oma p-elementti
        const resultElement = document.getElementById("id-result");
        resultElement.innerHTML = ""; //Tyhjennetään elementti

        //Käydään forEach lauseella taulukko läpi, arvo = line -> Luodaan p -> heitetään textContentina -> appendChild
        result.forEach(line => {
            const paragraph = document.createElement("p")
            paragraph.textContent = line
            resultElement.appendChild(paragraph) //Lisätää luotu p lapsi elementtinä id-results elementin sisään
        })

        //Testi tulosteet
        console.log(result);
    }
});

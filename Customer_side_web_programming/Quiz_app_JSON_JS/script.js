document.addEventListener('DOMContentLoaded', function () { //Ladataan html ensin -> js suoritus sen jälkeen
    fetch("questions.json").then(function (response) {   //Haetaan json tiedosto -> paluu json muotoinen data
        return response.json();
    }
    ).then(function (data) {     //Data parametri automaattisesti sisältää json tiedoston sisällön ketjuttaessa -> Array
        console.log(data);      //Tulostetaan data konsoliin

        //JS koodi form html elementin tekoon -> Käydään läpi json ja lisätään data radio buttoneihin ym.
        //Bootstrapilla luodaan grid leveys=12 -> Muuten form += lisäämään koko setti kerralla. -> Tehokkaampi
        //https://getbootstrap.com/docs/5.3/utilities/spacing/#margin-and-padding
        let form = `<form class="mt-200 px-2">\n`; //px padding x-akselilla -> mt-3 margin top 3
        data.forEach((question, questionIndex) => { //Muuttuja nimet opiskelija ysätävllisemmiksi
            form += `<div class="row">\n 
                <div class="col-12 mb-4">\n  
                <p class="mb-2 fw-bold">${question.text}<\/p> 
                <fieldset class="m-4">\n`; //Lisätään fieldset elementti
                //Lisäys div -> bootstrap grid rivi + bootstrap grid sarake + Lisätään formiin kysymys <p> elementtinä -> Avain text

            //Lisätään vastaukset omaan diviin -> form-check muotoilut bs pitää rButtonit tekstissä kiinni
            question.choices.forEach((choice, choiceIndex) => {    //Käydään läpi choises avaimen arvot -> Liitetään vaihdeehtot indexin avulla tekstiksi+luodaan name attribuutti + id
                form += `<div class="form-check">\n
                    <input class="form-check-input" type="radio" id="question-${questionIndex}-${choiceIndex}" 
                        name="question-${questionIndex}" value="${choiceIndex}">
                    <label class="form-check-label" for="question-${questionIndex}-${choiceIndex}"> ${choice.text}<\/label>\n`;
            }); //Bs hoitaa välityksen kuten pitää -> ei tarvita br:ää
            form += `</fieldset>\n`; //Suljetaan fieldset elementti
        });

        form += '<button id="button" class="btn btn-primary" type="submit">Answer</button>';

        document.getElementById("container").innerHTML = form + '<div id="results" class="mt-3"></div>'; //Syötetään rakennettu form muuttuja html elementtiin id:llä container + luodaan results

        //Buttonin toiminnot jQuery
        $(function () {
            $("#button").button();
        });

        //Funktio napin painamiseen
        $("#button").click(function (event) {
            event.preventDefault();
            checkAnswers(event, data);
        });
    }
    ).catch(function (error) {  //Virheenkäsittely -> Tulostus konsoli
        console.log(error);
    });

    function checkAnswers(event, data) {
        event.preventDefault(); //Estetään lomakkeen lähettäminen
        let answers = document.querySelectorAll(":checked"); //Haetaan kaikki valitut vaihtoehdot
        let points = 0; //Alustetaan pisteet
        let allChecked = true;
        let message = "";
        
        if(answers.length !== data.length) { //Toimii rButtoneilla, jos vaihtoehtoja olis enempi ei toimis -> Poistettu kovakoodattu 3 ja vaihdettu json alkioiden määrä
            allChecked = false;
        } else { //Ei tarvita erikseen allChecked true, koska se oletusarvo
            answers.forEach((answer) => { //Käydään läpi valitut vaihtoehdot
                let idMatch = answer.id.match(/question-(\d+)-(\d+)/); //Matchataan id:n numerot
                let questionIndex = idMatch[1]; //Kysymyksen numero
                let choiceIndex = idMatch[2]; //Vaihtoehdon numero
                points += data[questionIndex].choices[choiceIndex].points; //Lasketaan pisteet
            });
        } //Else loppuu

        if (!allChecked) {
            message = "Please answer all questions!";
        } else {
            console.log(points); //Tulostetaan pisteet konsoliin - testikoodi
            if (points <= 1) {
                message = `You got ${points} ${points === 1 ? "point" : "points"}! You&acute;re not equipped for space travel`; //0 -> points, ehto points=1 -> muuttaa point
             } else {
                message = `You got ${points} points! Get your towel ready! <i class="bi bi-rocket"></i>`;
             }
        }
        document.querySelector("form").reset();    
        document.getElementById("results").innerHTML = message; //Syötetään pisteet html elementtiin id:llä results -> ei käyttäjä teksti syötteitä
    }

}); //Viimeinen sulkee DOM content loaderin 

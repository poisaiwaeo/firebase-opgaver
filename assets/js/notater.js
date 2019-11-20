//HTML_elementer
const notecontainer = document.getElementById("notes");
const inp = document.querySelector("#inpNotattekst");

//Event-Lytter på input-feltet
inp.addEventListener("keyup", opretNotat); //eller "input" 

const wsurl = "https://notatliste-29e11.firebaseio.com/";



//Kald databasen når siden loader og vis alle notater fra Firebase på siden:
kaldWebserviceHentAlle();


//*** LOGIN ***************************************/
//*******************************************************
let mintoken = null; // Token som vi får fra Firebase hvis Login godkendes

loginNu(); //Klad LoginNu funktionen

function loginNu() {

    //GET
    //Api key fra
    fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCBXDlG_B7r8-7YsFd-sLkPE0F3etN6Qy4", {
        method: 'POST',
        body: JSON.stringify({
            email: 'wipa0001@videndjurs.net',
            password: 'Poiski13s',
            returnSecureToken: true
        })
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        console.log(json);
        mintoken = json.idToken;
    }).catch(function (error) {
        console.log(error);
    });
}



//*** VIS ALLE NOTATER ***************************************/
//*******************************************************

function kaldWebserviceHentAlle() {

    //GET
    fetch(wsurl + "/notater.json", {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        udskrivNoter(json);
    }).catch(function (error) {
        console.log(error);
    });
}

function udskrivNoter(noterjson) {

    //Tøm tidligere indlæste notater for at undgå dubletter
    notecontainer.innerHTML = "";

    //Loop alle notater ind (ved pageLoad + efter opret, ret og slet)
    //Loop objektets keys igennem - altså ID'erne
    for (let id of Object.keys(noterjson)) {


        //Lav en <div class= "note">...
        var notediv = document.createElement("div");
        notediv.className = "note";


        //Lav en <p> med notattekst
        //... og gør det contenteditable og med ID i attributten data-id
        var p = document.createElement("p");
        p.setAttribute("data-id", id);
        p.setAttribute("contenteditable", "true");
        p.onkeydown = function (e) {

            //Hvis der klikke på return/enter...
            if (e.keyCode === 13) {
                e.preventDefault();
                kaldWebserviceRet(this); //this = p som der er keyevents på
            }
        };
        p.innerHTML = noterjson[id].notat;


        //Lav <div> med sletsymbol
        var sletdiv = document.createElement("div");
        sletdiv.setAttribute("data-id", id);
        sletdiv.innerHTML = "&#9746;";
        sletdiv.onclick = function () {
            kaldWebserviceSlet(this.getAttribute("data-id"));
        };


        //Tilføj p til notediv
        notediv.appendChild(p);
        notediv.appendChild(sletdiv);


        //Tilføj notediv til div#notes
        notecontainer.appendChild(notediv);


    }
}


//*** POST - OPRET NOTAT ***************************************/
//*******************************************************

function opretNotat(e) {

    //Hvis der er klikket på enter (=13)
    if (e.keyCode === 13) {

        //console.log(e.target.value);
        kaldWebserviceOpret(e.target.value);
        inp.value = "";
    }
}

function kaldWebserviceOpret(inp) {

    const nytnotat = { "notat": inp };

    //POST
    fetch(wsurl + "/notater.json?auth=" + mintoken, {
        method: 'POST',
        body: JSON.stringify(nytnotat)
    }).then(function () {

        console.log("OK");
        kaldWebserviceHentAlle();

    }).catch(function (error) {
        console.log(error);
    });
}


//*** DELETE - SLET NOTAT ***************************************/
//*******************************************************

function kaldWebserviceSlet(notatid) {

    //console.log("Der er klikket på slet - id = " + notatid);

    //DELETE
    fetch(wsurl + "/notater/" + notatid + ".json?auth=" + mintoken, {
        method: 'DELETE'
    }).then(function () {

        kaldWebserviceHentAlle(); //Genindlæs indhold/noter så den slettede er væk

    }).catch(function (error) {
        console.log(error);
    });

}


//*** PUT - RET NOTAT ***************************************/
//*******************************************************

function kaldWebserviceRet(p) {

    let notatid = p.getAttribute("data-id");
    let notattxt = p.innerHTML.replace("<br>", ""); //Fjern <br> fra teksten

    //console.log(notatid);
    //console.log(notattxt);

    let rettetnotat = { "notat": notattxt };

    //PUT
    fetch(wsurl + "/notater/" + notatid + ".json?auth=" + mintoken, {
        method: 'PUT',
        body: JSON.stringify(rettetnotat)
    }).then(function () {

        kaldWebserviceHentAlle(); //Genindlæs indhold/noter nu med rettet note

    }).catch(function (error) {
        console.log(error);
    })

}
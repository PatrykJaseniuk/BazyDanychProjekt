const { Client } = require('pg');

const client = new Client({
    user: 'user',
    host: 'localhost',
    database: 'baza',
    password: 'password',
    port: 5431,
})

client.connect();


loadTable(['idklient', 'imie', 'nazwisko'], 'parys.klient', 'tabele');
loadTable(['idsprzedawca', 'imie', 'nazwisko'], 'parys.sprzedawca', 'tabele');
loadTable(['idkarnet', 'datazakupu', 'iloscwizyt', 'cena'], 'parys.karnet', 'tabele');
loadTable(['idupowaznienie', 'nazwa'], 'parys.upowaznienie', 'tabele');
loadTable(['idwizyta', 'datawejscia', 'klient_idklient'], 'parys.wizyta', 'tabele');
loadTable(['idznizka', 'nazwa', 'wartoscznizki'], 'parys.znizka', 'tabele');
loadTable(['idsprzedawca', 'imie', 'nazwisko', 'cena'], 'parys.sprzedarzpracownikow', 'tabele');
loadTable(['idsprzedawca', 'imie'], 'parys.prostywidok', 'tabele');
loadTable(['idklient', 'imie', 'nazwisko'], 'parys.prostywidokklient', 'tabele');




function loadTable(kolumny, tabelaNazwa, htmlParent)
{
    let parentDOM = document.getElementById(htmlParent);
    let divDOM = document.getElementById(tabelaNazwa)

    jezeliNieMaTakiejTabeliStworz();
    czyszczenieZawartosciTabeli();
    stworzNaglowekTabeli();
    zapytanie = generujSQLSelect();
    client.query(zapytanie, (err, res) =>
    {
        if (err != null)
        {
            console.log(err.stack);
        }
        else
        {
            console.log(res.rows);
            let wiersze = res.rows;

            const tabelDOM = document.createElement('table');
            tabelDOM.className = "table-primary";
            divDOM.appendChild(tabelDOM);
            stworzNazwyKolumn();
            stworzCialo();

            function stworzNazwyKolumn()
            {
                theadDOM = document.createElement('thead');
                tabelDOM.appendChild(theadDOM);

                kolumny.forEach(kolumna =>
                {
                    var thDOM = document.createElement('th');
                    theadDOM.appendChild(thDOM);

                    var textDOM = document.createTextNode(kolumna);
                    thDOM.appendChild(textDOM);
                });
            }

            function stworzCialo()
            {
                let tbodyDOM = document.createElement('tbody');
                tabelDOM.appendChild(tbodyDOM);
                wiersze.forEach(wiersz =>
                {
                    let trDOM = document.createElement('tr');
                    tbodyDOM.appendChild(trDOM);


                    let inputy = [];
                    kolumny.forEach(kolumnaNazwa =>
                    {
                        let tdDOM = document.createElement('td')
                        trDOM.appendChild(tdDOM);

                        let inputDOM = document.createElement('input');
                        tdDOM.appendChild(inputDOM);
                        inputDOM.value = wiersz[kolumnaNazwa];

                        inputy[kolumnaNazwa] = inputDOM;
                        // let textDOM = document.createTextNode(wiersz[kolumnaNazwa]);
                        // tdDOM.appendChild(textDOM);
                    })

                    stworzEdycjeWiersza();


                    let buttonDelete = document.createElement('button');
                    buttonDelete.appendChild(document.createTextNode('Usun'));
                    buttonDelete.className = "btn btn-danger";
                    buttonDelete.type = "button";
                    trDOM.appendChild(document.createElement('td').appendChild(buttonDelete));
                    buttonDelete.onclick = () => { usunWiersz(kolumny[0], wiersz[kolumny[0]], tabelaNazwa) };


                    function stworzEdycjeWiersza()
                    {
                        let buttonUpdate = document.createElement('button');
                        buttonUpdate.appendChild(document.createTextNode('Zmien'))
                        buttonUpdate.className = 'btn btn-warning';
                        trDOM.appendChild(document.createElement('td').appendChild(buttonUpdate));

                        buttonUpdate.onclick = function ()
                        {
                            let sqlSet = ""
                            kolumny.forEach((nazwaKolumny) =>
                            {
                                sqlSet += nazwaKolumny + '= \'' + inputy[nazwaKolumny].value + '\', ';
                            })
                            sqlSet = sqlSet.substring(0, sqlSet.length - 2);
                            let sqlUpdate = 'UPDATE ' + tabelaNazwa + ' SET ' + sqlSet + ' WHERE ' + kolumny[0] + ' = \'' + inputy[kolumny[0]].value + '\' ';
                            client.query(sqlUpdate, function (err, res) { if (err) { console.log(err.stack) } });
                            loadTable(kolumny, tabelaNazwa, htmlParent)
                        }
                    }
                })
                stworzDodawanieWiersza();

                function stworzDodawanieWiersza()
                {
                    let trDOM = document.createElement('tr');
                    tbodyDOM.appendChild(trDOM);

                    let inputy = {};
                    kolumny.forEach(kolumna =>
                    {
                        let tdDOM = document.createElement('td');
                        trDOM.appendChild(tdDOM);

                        let inputDOM = document.createElement('input');
                        tdDOM.appendChild(inputDOM);
                        inputDOM.type = 'text';
                        inputy[kolumna] = inputDOM;

                    })

                    let tdDOM = document.createElement('td');
                    trDOM.appendChild(tdDOM);

                    let buttonAdd = document.createElement('button');
                    buttonAdd.appendChild(document.createTextNode('dodaj'));
                    buttonAdd.className = 'btn btn-success'
                    tdDOM.appendChild(buttonAdd);

                    buttonAdd.onclick = () =>
                    {
                        let sqlKolumny = "";
                        kolumny.forEach(element =>
                        {
                            sqlKolumny += element + ', ';
                        });
                        sqlKolumny = sqlKolumny.substring(0, sqlKolumny.length - 2)

                        let sqlValues = "";
                        kolumny.forEach(kolumna =>
                        {
                            sqlValues += '\'' + inputy[kolumna].value + '\'' + ', ';
                        });
                        sqlValues = sqlValues.substring(0, sqlValues.length - 2)
                        sql = 'INSERT INTO ' + tabelaNazwa + ' (' + sqlKolumny + ') VALUES (' + sqlValues + ')';

                        client.query(sql, function (err, res) { if (err) { console.log(err.stack) } });
                        loadTable(kolumny, tabelaNazwa, htmlParent)
                    }
                }

            }
            function usunWiersz(nazwakolumny, idDoUsuniecia, tabelaNazwa)
            {
                console.log('usuwam:' + nazwakolumny + ' ' + idDoUsuniecia + ' ' + tabelaNazwa);

                sql = 'DELETE FROM ' + tabelaNazwa + ' WHERE ' + nazwakolumny + ' = ' + idDoUsuniecia;
                client.query(sql, function (err, res) { if (err) { console.log(err.stack) } });
                loadTable(kolumny, tabelaNazwa, htmlParent);
            }
        }
    })

    function generujSQLSelect()
    {
        let sqlKolumny = "";
        kolumny.forEach(element =>
        {
            sqlKolumny += element + ', ';
        });
        sqlKolumny = sqlKolumny.substring(0, sqlKolumny.length - 2)
        return 'SELECT ' + sqlKolumny + '  from ' + tabelaNazwa;
    }

    function stworzNaglowekTabeli()
    {
        let naglowekDOM = document.createElement('h2');
        naglowekDOM.appendChild(document.createTextNode(tabelaNazwa));
        divDOM.appendChild(naglowekDOM);
    }

    function czyszczenieZawartosciTabeli()
    {
        divDOM.innerHTML = "";
    }

    function jezeliNieMaTakiejTabeliStworz()
    {
        if (!divDOM)
        {
            divDOM = document.createElement('div');
            divDOM.id = tabelaNazwa;
            divDOM.className = 'tab-pane tabcontent ';
            divDOM.ariaLabel = 'nav-profile-tab'
            parentDOM.appendChild(divDOM);

            let navTabDOM = document.getElementById('nav-tab');
            // navTabDOM.innerHTML += '<button class="" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#' + tabelaNazwa + '" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">' + tabelaNazwa + '</button>'
            let buttonTab = document.createElement('button');
            buttonTab.className = ' tablinks nav-link';
            buttonTab.onclick = () =>
            {
                loadTable(kolumny, tabelaNazwa, htmlParent); openTab(event, tabelaNazwa)
            }
            buttonTab.appendChild(document.createTextNode(tabelaNazwa));
            navTabDOM.appendChild(buttonTab);

        }
    }

}

function openTab(evt, cityName)
{
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++)
    {
        tabcontent[i].style.display = "none";
    }

    // // Get all elements with class="tablinks" and remove the class "active"
    // tablinks = document.getElementsByClassName("tablinks");
    // for (i = 0; i < tablinks.length; i++)
    // {
    //     tablinks[i].className = tablinks[i].className.replace(" active", "");
    // }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    // evt.currentTarget.className += " active";
}


# 6. Jednoduchá paměť na SPARQL dotazy v čistém JS 

## Úkol:
### 1) Vytvořit Javascriptový nástroj, který bude snadno vložitelný do jiných webových projektů (ideálně jeden javascript soubor k načtení v html hlavičce) a bude umět:
   * odeslat SPARQL dotaz na zadaný libovolný SPARQL endpoint (ajax)          --------- DONE
   * vypsat výsledek dotazu do triviální webové tabulky                       --------- DONE
   * načíst/uložit dotaz do místní paměti problížeče (browser local storage)  --------- DONE
   * spravovat uložené dotazy                                                 --------- DONE
   * vyhledávat v uložených dotazech                                          --------- DONE
   * verzovat dotazy                                                          --------- DONE

### Data:
   * dle svého uvážení, případně na vyžádání dodám SPARQL datazy a příslušné datasety

### Upřesnění:
   * V souboru ajax_queries.js je minimalistická ukázka použití browser local storage a AJAX call vůči Fuseki sparql endpointu a vůči Virtuoso endpointu
   * Fuseki sparql endpoint - localhost, je potřeba si spustit u sebe, založit db, něco do ní nahrát - např. přiložený ttl soubor
   * Virtuoso - https://dbpedia.org/sparql (pro vzdálené volání třeba oprávnění)
   * Všimněte si rozdílu ve struktuře odpovědí. Jiné úložiště než Fuseki a Virtuoso nepoužíváme.
   * Ukázkové dotazy, můžete využít příklady ve druhém cvičení DBM2.

### Dodělávky:
   * HTML ukázka - několik klikatelných dotazů, které se vyplní do formuláře a pošlou na server                         --------- DONE
   * ukázka práce s QueryManagerem (jak vypadají struktury před uložnením dotazu a po uložení) + jak sestavit projekt
   * Dokuementace, jaké problémy jsem řešil, obrázek aplikace, atd ...
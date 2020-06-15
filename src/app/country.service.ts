import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from './country';



let headers = { 
  'content-type': 'application/json',
  'apikey':'API-KEY-SU-ISOLAR-PANEL',
  'sukey':'866b1023629f7b29933ef0d20a71ee7268bff6e362afa5e1443cbdd5ef',
  'reqfrom':'pnl'
} 

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http: HttpClient) { }
  
  listCountries(page_no:any){

    // const body=JSON.stringify(page_no);
    // console.log('Body:::',page)
    console.log('page no::::',page_no)
    return this.http.get<Country[]>(`http://localhost/my-crud-app/list.php?page_no=${page_no}`);
  }
  
  listCountriesSearch(){
    return this.http.post<Country[]>(`http://128.199.133.211:3018/admapi/countries/table`, {}, { 'headers': headers });
  }
}

// http://128.199.133.211:3018/admapi/countries/selectList
// http://www.json-generator.com/api/json/get/cfXMRBJmmq?indent=2
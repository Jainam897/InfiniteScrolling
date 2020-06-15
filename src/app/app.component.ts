import { Component, ViewChild, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatSelect } from '@angular/material/select';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ChartComponent } from 'ng-apexcharts';
import { Color, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { take, takeUntil, filter, tap, debounceTime, map, delay } from 'rxjs/operators';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ReplaySubject, Subject, Observable } from 'rxjs';
import { CountryService } from './country.service';
import { Country } from './country';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { MatOptionSelectionChange } from '@angular/material/core';
import { ListRange } from '@angular/cdk/collections';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport, { static: false })
  cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
  selectedItem: any;
  initialRange: ListRange = { start: 0, end: 5} as ListRange;

  getus: Country[];
  form: FormGroup;
  artists = [];
  // getcnt: [];
  length = 2;
  b: any;
  // a: any;
  searchChar: any;
  // storeData: any;
  // limit = 10;
  page_no = 1;
  obs: Observable<Country[]>;


  //  protected banks: Bank[] = BANKS;

  /** control for the selected bank for server side filtering */
  public CountryServerSideCtrl: FormControl = new FormControl();

  /** control for filter for server side. */
  public CountriesServerSideFilteringCtrl: FormControl = new FormControl();

  /** indicate search operation is in progress */
  public searching: boolean = false;

  /** list of banks filtered after simulating server side search */
  public filteredServerSideCountries: ReplaySubject<Country[]> = new ReplaySubject<Country[]>(1);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  constructor(public countryService: CountryService, private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {

  }
  dataSource: MatTableDataSource<Country>;

  loadMoreData() {
    let arr = [];
    arr = this.getus;
    if (this.searchChar) {
      console.log('In Load MOre Data');
      arr = this.getus.filter(Country => Country.fname.toLowerCase().indexOf(this.searchChar) > -1);
    } else {
      console.log('ELSE:::::');
    }
    // this.b = arr.slice(0, this.page)
    // this.filteredServerSideCountries.next(this.b);
    console.log('arr:::::', arr);
    this.filteredServerSideCountries.next(arr);
  }

  loadMore() {
    // this.page_no = this.page_no + 1;
    // this.limit = this.limit + 10;
    // this.loadMoreData();
    this.page_no++;
    this.getCountry(this.page_no);
  }


  getCountry(mypage: any) {
    console.log('in get country::', mypage);
    let tempArray = [];
    this.countryService.listCountries(mypage)
      .subscribe((country: any) => {
        console.log('cointry::;', country);
        country.map((x, i) => {
          tempArray.push(x);
        })
        if (!this.getus) {
          this.getus = tempArray;
        } else {
          console.log('tempArray:::', tempArray);

          tempArray.map((x, i) => this.getus.push(x));
        }

        // console.log('DATA:::::', this.getus);

        if (this.getus.length > 0) {
          console.log('this.getus', this.getus);
          this.loadMoreData();
        }
      });
  }

  // getFilteredData() {
  //   this.CountriesServerSideFilteringCtrl.valueChanges.subscribe((value) => {
  //     if (value) {
  //       var arr = [];
  //       // console.log('IF VALUE::::::', value);
  //       this.getus.filter(country => country.countryName.toLowerCase().indexOf(value) > -1).map((response) => {
  //         // console.log('map response::', response);
  //         arr.push(response);
  //         // console.log('arr::', arr);
  //         this.searching = false;
  //         this.filteredServerSideCountries.next(arr);
  //       })
  //     } else {
  //       this.getCountry(this.page);
  //       // this.filteredServerSideCountries.next(null);
  //       console.log('ELSE NO VALUE');
  //     }
  //   });

  // }

  getFilteredData() {
    // const filterValue = (event.target as HTMLInputElement).value;
    this.CountriesServerSideFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        map(search => {
          console.log('SEARCH::::', search)
          this.searchChar = search;
          console.log('THIS SEARCHBAR::::', this.searchChar)
          if (!this.getus) {
            console.log('IF:::');
            return [];
          }
          return this.getus.filter(country => country.fname.toLowerCase().indexOf(search) > -1);
        }),
        delay(500)
      ).subscribe(filteredCountries => {
        console.log('aaaaa', this.searchChar);
        // this.getCountry(this.getus.length)
        this.searching = false;
        console.log('SEARCHING::::', this.searching);

        // console.log('filteredCountries::', filteredCountries);
        // this.filteredServerSideCountries.next(filteredCountries);
        // this.getcountrywhole();
        this.loadMoreData();
        // this.obs = this.dataSource.connect();
      }, error => {
          console.log('Error::', error);
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // this.getus.filter = filterValue.trim().toLowerCase();
    return this.getus.filter(country => country.fname.toLowerCase());

  }

  ngOnInit(): void {
    console.log('this.page_no on init', this.page_no)
    this.getCountry(this.page_no);
    this.getFilteredData();
    // this.getcountrywhole();
  }

  openChange($event: boolean) {
    console.log("open change", $event);
    if ($event) {
      this.cdkVirtualScrollViewPort.scrollToIndex(0);
      this.cdkVirtualScrollViewPort.checkViewportSize();
    } else {
    }
  }

  onSelectionChange(change: MatOptionSelectionChange) {
    if (change.isUserInput) {
      console.log("onSelectionChange", change.source.value);
      this.selectedItem = change.source.value;

    }

  }

  scrolledIndexChange(event) {
    // if (!this.initialRange) {
    //   // console.log('Initial Range::::', this.initialRange)
    //   this.initialRange = this.cdkVirtualScrollViewPort.getRenderedRange();

    // }
    // else {
      //   // this.loadMore();
      // }
    console.log('event:::', event);
    if (event > 0) {
      this.loadMore();
    }

  }

  getcountrywhole() {
    this.countryService.listCountriesSearch().subscribe((cntData: any) => {
      console.log(cntData);
      this.getus = cntData.data;
      console.log('DATA::::', this.getus)
      // console.log('Country Name::::',countryData)
    })
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  
}


















    // this.bankServerSideFilteringCtrl.valueChanges
    //   .pipe(

    //     filter(search => !!search),
    //     tap(() => this.searching = true),
    //     takeUntil(this._onDestroy),
    //     debounceTime(200),
    //     map(search => {
    //       if (!this.getus) {
    //         return [];
    //       }

    //       // simulate server fetching and filtering data
    //       return this.b.filter(Country => Country.name.toLowerCase().indexOf(search) > -1);

    //     }),
    //     delay(500)
    //   )

    //   .subscribe(filteredBanks => {
    //     this.searching = false;
    //     this.filteredServerSideBanks.next(filteredBanks);
    //     // this.obs = this.dataSource.connect();


    //   },

    //     error => {
    //       // no errors in our simulated example
    //       this.searching = false;
    //       // handle error...
    //     });













  // this.form = this.fb.group({
  //   country:['', Validators.required],
  // })
  // this.getCountry();
  // this.form.setValue(this.getus);
  // // console.log( 'jbsas::::::', this.form.setValue(this.getus));

  // // load the initial bank list
  // this.filteredCountry.next(this.getus.slice());
  // console.log('Data GetUs::::',this.getus);

  // // listen for search field value changes
  // this.countryFilterCtrl.valueChanges
  //   .pipe(takeUntil(this._onDestroy))
  //   .subscribe(() => {
  //     this.filterCountry();
  //   });





  //   this.bankCtrl.setValue(this.banks[10]);

  //   // load the initial bank list
  //   this.filteredBanks.next(this.banks.slice());

  //   // listen for search field value changes
  //   this.bankFilterCtrl.valueChanges
  //     .pipe(takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       this.filterBanks();
  //     });


  // private filterCountry  () {
  //   if (!this.getus) {
  //     return;
  //   }
  //   // get the search keyword
  //   let search = this.countryFilterCtrl.value;
  //   if (!search) {
  //     this.filteredCountry.next(this.getus.slice());
  //     return;
  //   } else {
  //     search = search.toLowerCase();
  //   }
  //   // filter the banks
  //   this.filteredCountry.next(
  //     this.getus.filter(Country => Country.text.toLowerCase().indexOf(search) > -1)
  //   );
  // }

  // private filterBanks() {
  //   if (!this.banks) {
  //     return;
  //   }
  //   // get the search keyword
  //   let search = this.bankFilterCtrl.value;
  //   if (!search) {
  //     this.filteredBanks.next(this.banks.slice());
  //     return;
  //   } else {
  //     search = search.toLowerCase();
  //   }
  //   // filter the banks
  //   this.filteredBanks.next(
  //     this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
  //   );
  // }


  // ngAfterViewInit() {
  //   // this.setInitialValue();
  //   this.setInitialCountryValue();
  // }

  // private setInitialValue() {
  //   this.filteredBanks
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {          
  //       // setting the compareWith property to a comparison function 
  //       // triggers initializing the selection according to the initial value of 
  //       // the form control (i.e. _initializeSelection())
  //       // this needs to be done after the filteredBanks are loaded initially 
  //       // and after the mat-option elements are available
  //       this.singleSelect.compareWith = (a: Bank, b: Bank) => a.id === b.id;
  //     });
  // }

  // private setInitialCountryValue() {
  //   this.filteredCountry
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {          
  //       // setting the compareWith property to a comparison function 
  //       // triggers initializing the selection according to the initial value of 
  //       // the form control (i.e. _initializeSelection())
  //       // this needs to be done after the filteredBanks are loaded initially 
  //       // and after the mat-option elements are available
  //       this.singleSelect.compareWith = (a: Country, b: Country) => a.id === b.id;
  //     });
  // }


//  dataSource = new MatTableDataSource<Country[]>();

/** Subject that emits when the component has been destroyed. */

  // public bankCtrl: FormControl = new FormControl();
  // public bankFilterCtrl: FormControl = new FormControl();


  // public countryCtrl: FormControl = new FormControl();
  // public countryFilterCtrl: FormControl = new FormControl();

  // public filteredBanks: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);
  // public filteredCountry: ReplaySubject<Country[]> = new ReplaySubject<Country[]>(1);



        // console.log('data:::', data);
        // this.b = data.slice(10, 10)

        // console.log('slicedta',data.slice(1, 10))

        //  this.b = this.getus.splice(0,10);
        // console.log(this.b)


        // data.forEach((response) => {
        //   // console.log('API RESPONCE:::', response)
        //   let tempData = {
        //     code: response.code,
        //     name: response.name,
        //   }
        //   console.log('tempData::', tempData);
        //   tempArray.push(tempData);
        //   console.log('tempArray::', tempArray);
        // });
        // this.getus = tempArray;
        // console.log(this.getus)
        // for (let i = 0; i < data.length; i += 5) {
        //   // this.getus.length=i;
        //   this.getus = data;
        //   // console.log('index::::', this.getus.length)
        //   console.log(i)
        // }
        // console.log('this.getus', this.getus);
        // let DATA : Country[] = this.getus;
        // console.log(DATA);
        // this.dataSource = new MatTableDataSource<Country>(DATA);
        // this.changeDetectorRef.detectChanges();
        // console.log(this.dataSource);
        // for(let i=0;i<DATA.slice.length;i++){
        //   console.log('DATA:::::',DATA);
        // }

        // this.dataSource.data = data.results;
        // this.dataSource.paginator = this.paginator;
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class ProcessHTTPMsgService {

  constructor() { }

  public handleError (error: HttpErrorResponse | any) {
    let errorMsg: string;
    if(error.error instanceof ErrorEvent) {
      errorMsg = error.error.errorMsg;
    } else {
      errorMsg = `${error.status} - ${error.statusText || ''} ${error.error}`; 
    }
    return(throwError(errorMsg));
  }
}

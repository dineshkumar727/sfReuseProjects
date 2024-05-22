import { LightningElement ,api,wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import getCategoryList from '@salesforce/apex/createCaseMetaDatafieldSetCtr.getCategoryList';
import getFieldSetFieldsByFieldSetName from '@salesforce/apex/createCaseMetaDatafieldSetCtr.getFieldSetFieldsByFieldSetName';
export default class createCaseMetaDatafieldSet extends NavigationMixin(LightningElement) {

    @api objectApiName;
    sObjectName = 'Case';
    @api fieldsToFetchFieldSet ='FieldSetOne';
    @api parentId;
    @api recordId;

    @wire(CurrentPageReference)
    pageRef;
    disableButton=false;
    elementSize = 6;
    selectedCategory ;
    selectedSubCategory ;
    selectedDetail ;
    accountID = '';
    contactID= '';
    assetId = '';
    categorySubCategoryMap = new Map();
    categoryDetailMap = new Map();
    categoryArray =false;
    detailArrya = false ;
    subCategoryArray = false;
    open =false;
    error;
    caseFields ;

    autoPopulateFieldValue(){
        this.caseFields = this.caseFields.map(obj=> {
            let tempObj = { ...obj};
            tempObj.value = tempObj.apiName == "AccountId" ? this.accountID  : tempObj.apiName == "ContactId" ?  this.contactID  : tempObj.apiName == "AssetId" ? this.assetId : '';
               return tempObj;
        });

    }

   /***
    contactParent( parentId ) {
        getContactParent({ idParent : parentId })
            .then((result) => {
                console.log(result);
                if( result[0].AccountId != undefined && result[0].AccountId != null ){
                  this.accountID =   result[0].AccountId;
                }
                this.error = undefined;
       this.autoPopulateFieldValue();
               
            })
            .catch((error) => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!!',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    assetParent( parentId ) {
        getAssetParent({ idParent : parentId })
            .then((result) => {
                console.log(result);
                if(result[0].AccountId != undefined && result[0].AccountId != null){
                    this.accountID =  result[0].AccountId  ;
                }
                if(result[0].ContactId != undefined && result[0].ContactId != null){
                    this.contactID =  result[0].ContactId  ;
                }
                this.error = undefined;
                this.autoPopulateFieldValue();
            })
            .catch((error) => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!!',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }
     */

    connectedCallback(){
        console.log('------------'+ this.parentId);
        if(this.parentId != null && this.parentId != undefined ){
             if( this.parentId.substring(0,3) == '001' ){
                this.accountID = this.parentId;
             } else if(this.parentId.substring(0,3) == '003'){
                this.contactID = this.parentId;
                //this.contactParent( this.parentId );
             } else if( this.parentId.substring(0,3) == '02i'){
                this.assetId = this.parentId;
               // this.assetParent( this.parentId );
             }
        }
        window.addEventListener("popstate", ()=>{
            console.log('change of hash')
            eval("$A.get('e.force:refreshView').fire();");
            this.accountID = '';
            this.parentId = '';

        });

        window.onpopstate = (ev) => {
            // get the state for the history entry the user is going to be on
            console.log(ev.state);
            const state = ev.state;
            if(state && state.pageNumber) {
                this.pageNumber = state.pageNumber;
            }
        };

    }

    
    @wire(getFieldSetFieldsByFieldSetName, {objectApiName: '$sObjectName', fieldSetName: '$fieldsToFetchFieldSet'})
    wiredFieldsToFetchFieldSet(result){
        if (result.data) {
            this.error = undefined;
            this.caseFields = result.data.map(obj=> {
                let tempObj = { ...obj};
                tempObj.value = tempObj.apiName == "AccountId" ? this.accountID  : tempObj.apiName == "ContactId" ?  this.contactID  : tempObj.apiName == "AssetId" ? this.assetId : null;
                   return tempObj;
                });

        } else if (result.error) {
            this.error = result.error;
        }
    }

    @wire(getCategoryList)
    wiredgetCategoryList(result) {
        if (result.data) {
            console.log('Wire Method Called' );
            this.error = undefined;
            this.categoryArray = new Array();
            this.detailArrya = new Array();
            result.data.forEach(element => {
                if(!this.categorySubCategoryMap.has(element.Category__c)){
                this.categorySubCategoryMap.set(element.Category__c,new Array());
                }this.categorySubCategoryMap.get(element.Category__c).push(element.Subcategory__c);

                if(!this.categoryDetailMap.has(element.Category__c)){
                    this.categoryDetailMap.set(element.Category__c,new Array());
                    }this.categoryDetailMap.get(element.Category__c).push(element.Detail__c);

            });
            let arrayTemp =   Array.from( this.categorySubCategoryMap.keys() );
            arrayTemp.forEach(element => {
                this.categoryArray.push({label: element, value: element  });
                this.open =true;
            });

        } else if (result.error) {
            this.error = result.error;
        }
    }

    handleChange(event){
        if(event.currentTarget.name == 'Category'){
        this.selectedCategory = event.target.value;
        this.subCategoryArray = new Array();
       let arrayTemp =   this.categorySubCategoryMap.get(event.target.value);
       arrayTemp.forEach(element => {
        this.subCategoryArray.push({label: element, value: element  });
        this.open =true;
            });
            this.detailArrya = new Array();
            let arraydetail =  this.categoryDetailMap.get(event.target.value);
            arraydetail.forEach(element => {
                this.detailArrya.push({label: element, value: element  });
            });

        }
        console.log(event.target.value);
        if(event.currentTarget.name == 'Sub Category'){
            this.selectedSubCategory = event.target.value;
        }

        if(event.currentTarget.name == 'Detail'){
            this.selectedDetail = event.target.value;
        }
        
        
    }




    handleSuccess(event) {
         // Close the modal window and display a success toast
         this.dispatchEvent(new CloseActionScreenEvent());
         this.dispatchEvent(
             new ShowToastEvent({
                 title: 'Success',
                 message: 'Record updated!',
                 variant: 'success'
             })
         );
         this.resetFormAction(event);

         this[NavigationMixin.Navigate]({
             type: 'standard__recordPage',
             attributes: {
                 recordId: event.detail.id,
                 actionName: 'view',
             },
         });
    }


    handleCancel(event) {
    this.resetFormAction(event);
 this.disableButton = true;
    if(this.parentId != null && this.parentId.length > 14)
    {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.parentId ,
                actionName: 'view',
            },
        });
        
        // Add your cancel button implementation here
    } else{

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'list'
            } });
    }
        
     }

     handleButtonClick(){
        console.log(' Sumbit button Clicked');
    }

     
    handleLoad(){
 console.log('Hi' + this.pageRefString );
    }
 


    handleSubmit(event) {
        console.log('Handle form Sumbit');
        this.disableButton = true; 
    }


    
    get pageRefString() {
        return JSON.stringify(this.pageRef);
    }


    resetFormAction(event) {
        const lwcInputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (lwcInputFields) {
            lwcInputFields.forEach(field => {
                field.reset();
            });
        }

      const comboBoxFields = this.template.querySelectorAll(
            'lightning-combobox'
        );

    if (comboBoxFields) {
            comboBoxFields.forEach(field => {
                console.log(field.value);
              field.value="";
            });
        }
     }
}
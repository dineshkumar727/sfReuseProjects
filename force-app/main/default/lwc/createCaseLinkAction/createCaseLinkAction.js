import { LightningElement,api,wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { getRecord } from 'lightning/uiRecordApi';

const ACCOUNTFIELD = [
    'Account.Rating',
    'Account.Phone',
    'Account.Name',
];

export default class createCaseLinkAction extends NavigationMixin(LightningElement)  {
     objectName;
    _recordId;
    isExecuting = false;
    accountId;
    contactId;
    pickListOptions = [];
    IsAccount = false;
    IsContact =false;
    submitOnce = true;
    rolevalue;
    phone;
    subject;
    connectedCallback(event){

    }

    get objectApiName(){
        return this.objectName;
    }
    get roleOptions() {
        return [
            {label: 'Property Manager', value: 'Property Manager'},
            {label: 'Asset Manager', value: 'Asset Manager'},
            {label: 'Construction Manager', value: 'Construction Manager'},
            { label: 'Market Officer', value: 'Market Officer' },
        ];
    }


    @api
    set objectApiName(objectApiName) {
        if (objectApiName !== null) {
            this.objectName = objectApiName;

            if(objectApiName =='Account'){
                this.IsAccount = true;
                this.accountId = this.recordId;
            }else if(objectApiName =='Contact'){
                this.IsContact = true;
                this.contactId = this.recordId;
            }
       }
    }

    get recordId() {
        return this._recordId;
    }

    @api  set recordId(recordId) {
        if (recordId !== this._recordId) {
            this._recordId = recordId;
       }
    }

      @wire(CurrentPageReference)
      pageRef;

      get pageRefString() {
        return JSON.stringify(this.pageRef);
      }

    handleSuccess(event) {
        this.recordId = event.detail.id;
        let createdRecordName = event.detail.fields.CaseNumber.value;  
        this.handleCloseModal();
        /**    
        this.dispatchEvent(new CloseActionScreenEvent());
        this.dispatchEvent( new CustomEvent("reloadthepage", { detail: { value :'ReLoad' }}));
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Case '+ createdRecordName  +' was created!',
                variant: 'success'
            })
        );
         */ 
    }

    handleSubmit(event) {
        
        event.preventDefault();       
        const fields = event.detail.fields;    
        fields.Origin  = 'Phone';
        fields.Status = 'Working';
        this.subject = this.rolevalue +'-'+ this.subject;
        //fields.Subject = Subject+ '-'+ this.rolevalue;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
       
     }

    handleChange(event) {
       
        this.rolevalue = event.detail.value;
       

    }

    @wire(getRecord, { recordId: '$accountId', fields: ACCOUNTFIELD })
        getParentDetails({error, data}){
        if(data){
            this.subject = data.fields.Name.value;
            this.phone = data.fields.Phone.value;
            console.log('parent fields' + data);
        }else if(error){
            this.error = error;
        }
    }
    handleError(event) {
        console.log(event.detail);
    }

    handleLoad(event){
        console.log(event.detail);
    }

    handleCloseModal() {

    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.recordId,
            actionName: 'view',
        },
    });   
    }
    reloadThePage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { 
               url:window.history.back()
            },
        });        
    }
}
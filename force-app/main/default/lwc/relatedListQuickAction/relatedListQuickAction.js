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

export default class relatedListQuickAction extends NavigationMixin(LightningElement)  {

    @api parentId;
    @api recordId; // not getting this id
    propertyID;
    pickListOptions = [];
    isBuildingIdDisabled = false;
    submitOnce = true;
    subject;
    phone;
    value;
    accountId;
    @api objectApiName;

    get roleOptions() {
        return [
            {label: 'Property Manager', value: 'Property Manager'},
            {label: 'Asset Manager', value: 'Asset Manager'},
            {label: 'Construction Manager', value: 'Construction Manager'},
            { label: 'Market Officer', value: 'Market Officer' },
        ];
    }

    set roleOptions(obj){
        
    }
    
    connectedCallback(event){
        if (this.objectApiName !== null) {
            if(this.objectApiName =='Account'){
                this.IsAccount = true;
                this.accountId = this.parentId;
            }else if(this.objectApiName =='Contact'){
                this.IsContact = true;
                this.contactId = this.recordId;
            }
       }

    }

    handleSuccess(event) {
        
        this.hideModal();
        this.recordId = event.detail.id;
        let createdRecordName = event.detail.fields.CaseNumber.value;       
        this.dispatchEvent(new CloseActionScreenEvent());
        this.redirectCaseRecord();
        this.dispatchEvent( new CustomEvent("reloadthepage", { detail: { value :'ReLoad' }}));
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Property Contact '+ createdRecordName  +' was created!',
                variant: 'success'
            })
        );
    }

    handleSubmit(event) {
        event.preventDefault();       
        const fields = event.detail.fields;    
        fields.Origin  = 'Phone';
        fields.Status = 'Working';
        this.template.querySelector('lightning-record-edit-form').submit(fields);
       
     }

    handleShowModal() {
        const modal = this.template.querySelector('c-modal');
        modal.show();
    }

    handleChange(event) {
       
        let rolevalue = event.detail.value;
        this.subject = rolevalue +'-'+ this.subject;
    }

    hideModal() {
        const modal = this.template.querySelector('c-modal');
        modal.hide();
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
        this.handleShowModal() ;
        console.log(event.detail);
    }

    handleCloseModal() {

    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.parentId,
            actionName: 'view',
        },
    });   
    }

    redirectCaseRecord() {
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
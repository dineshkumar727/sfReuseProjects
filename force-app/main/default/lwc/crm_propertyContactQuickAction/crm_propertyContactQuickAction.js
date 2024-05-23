import { LightningElement,api,wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { getRecord } from 'lightning/uiRecordApi';

const BUILDINGFIELD = [
    'Link_Building__c.Name',
    'Link_Building__c.Property__c'
];

export default class PropertyContactQuickAction extends NavigationMixin(LightningElement)  {
    @api objectApiName;
    @api parentId;
    propertyID;
    pickListOptions = [];
    isBuildingIdDisabled = false;
    submitOnce = true;
    value;
    
    connectedCallback(event){
        if(this.objectApiName =='Link_Building__c'){
            this.isBuildingIdDisabled = true;
        }else{
            this.propertyID = this.parentId;
        }
        this.pickListOptions.push({label: 'Asset Manager', value: 'Asset Manager'});
        this.pickListOptions.push({label: 'Property Manager', value: 'Property Manager'});
        this.pickListOptions.push({label: 'Construction Manager', value: 'Construction Manager'});
        this.pickListOptions.push({label: 'Market Officer', value: 'Market Officer'});
    }

    handleSuccess(event) {
        
        this.hideModal();
        this.recordId = event.detail.id;
        let createdRecordName = event.detail.fields.Name.value;       
        this.dispatchEvent(new CloseActionScreenEvent());
        this.hideModal();
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
        fields.Role__c = this.value;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
       
     }

    handleShowModal() {
        const modal = this.template.querySelector('c-modal');
        modal.show();
    }

    handleChange(event) {
       
        this.value = event.detail.value;
    }
    hideModal() {
        const modal = this.template.querySelector('c-modal');
        modal.hide();
    }

    @wire(getRecord, { recordId: '$parentId', fields: BUILDINGFIELD })
        getBuildingDetails({error, data}){
        if(data){
            let BuildingName = data.fields.Name.value;
            this.propertyID = data.fields.Property__c.value;
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
    reloadThePage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { 
               url:window.history.back()
            },
        });        
    }
}
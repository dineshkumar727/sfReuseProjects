public with sharing class createCaseMetaDatafieldSetCtr {

    @AuraEnabled(cacheable=true)
    public static List<CuratedPicklistSetup__mdt> getCategoryList() {
        try {
        String userTitle = getUserTitle();
        return [SELECT Id, DeveloperName, Label, QualifiedApiName, Category__c, CategoryDescription__c, Subcategory__c, SubcategoryDescription__c, Detail__c, DetailDescription__c, UserTitle__c from CuratedPicklistSetup__mdt 
        WHERE UserTitle__c =: userTitle ];
         } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string getUserTitle(){
        String userId = UserInfo.getUserId();
        try {
          String userTitle= [SELECT ID,Title FROM USER WHERE ID =:userId ].Title;
            return UserTitle;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getInternalAccountId(){
        
        try {
            if('Internal Accont'!= null && String.isNotBlank('Internal Accont')){
                return [SELECT ID FROM Account  WHERE Name =:'Internal Accont' LIMIT 1 ].Id;
            }
              return null;
          } catch (Exception e) {
              throw new AuraHandledException(e.getMessage());
          }
    }



    @AuraEnabled(cacheable = true)
    public static List<FieldSetField> getFieldSetFieldsByFieldSetName(String objectApiName, String fieldSetName)
    {
        List<Schema.FieldSetMember> fieldSetMembers = ((SObject)Type.forName(objectApiName).newInstance()).getSObjectType().getDescribe().FieldSets.getMap().get(fieldSetName).getFields();
        //Equal to: 
        //List<Schema.FieldSetMember> fieldSetMembers = Schema.getGlobalDescribe().get(objectName).getDescribe().FieldSets.getMap().get(fieldSetName).getFields();
        List<FieldSetField> fields = new List<FieldSetField>();

        for (Schema.FieldSetMember fieldSetMember : fieldSetMembers)
        {
            FieldSetField fieldSetField = new FieldSetField(fieldSetMember);
            fields.add(fieldSetField);
        }

        return fields;
    }


 public class FieldSetField
{
    @AuraEnabled
    public Boolean dbRequired;
    @AuraEnabled
    public String apiName;
    @AuraEnabled
    public String label;
    @AuraEnabled
    public Boolean required;
    @AuraEnabled
    public String type;

    public FieldSetField(Schema.FieldSetMember fieldSetMember)
    {
        this.dbRequired = fieldSetMember.dbRequired;
        this.apiName = fieldSetMember.fieldPath;
        this.label = fieldSetMember.label;
        this.required = fieldSetMember.required;
        this.type = String.valueOf(fieldSetMember.getType());
    }
 }
}

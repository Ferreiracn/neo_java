/*global location*/
sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"acn/logistics/PurchasingPlanCockpit/model/formatter",
	"sap/m/MessageToast",         
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text"
], function (
	BaseController,
	JSONModel,
	Controller,
	History,
	formatter,
	MessageToast,
	Button,
	Dialog,
	Text
) {
	"use strict";
	
	return BaseController.extend("acn.logistics.PurchasingPlanCockpit.controller.NewPlan", {
		
		onInit: function() {
			this.getRouter("newPlan").attachRouteMatched(this.handleRouteMatched, this);
			this.byId("planName").setMaxLength(20);
		},
		

		/**********************************************
		 * DIALOG TESTE
		 *********************************************/
		handleSelectDialogPress: function (oEvent) {

			this._oDialog = sap.ui.xmlfragment("acn.logistics.PurchasingPlanCockpit.view.detailedPlan", this);
			this._oDialog.open();
			
		},
		handleClose: function(oEvent) {
			this._oDialog.destroy();
			this._oDialog = null;
			this._oDialog.close();
		},

		/**
		 * Event handler for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			window.history.go(-1);
			
		},
				
		/** 
		*Create a plan;
		*Checks if the name is null or empty, and send a message to the user
		*/
		onPressCreate: function(oEvent) {
			var controller = this;
			var planName = this.byId("planName").getValue();
		 	var dueDate = this.byId("dueDate").getDateValue();
	
			if (planName == null || planName.length === 0){
				this.showErrorMsg("Atenção","Error",this.getResourceBundle().getText("planField"));
				return;
			}
			if (dueDate == null || dueDate.length == 0){
				this.showErrorMsg("Error","Error",this.getResourceBundle().getText("dateField"));
				return;
			}
			
			if (dueDate < new Date()){
				this.showErrorMsg("Error","Error",this.getResourceBundle().getText("dateInvalid"));
				return;
			} 
		
			// ODataModel para criar o Plano
			var oModel = new sap.ui.model.odata.v2.ODataModel("/acn/logistics/purchasingplancockpit/d/service/Plan.xsodata", {
				useBatch: false
			});
			oModel.disableHeadRequestForToken = true;
			oModel.setDefaultBindingMode("TwoWay");
			oModel.useBatch =  false;
			
			oModel.attachRequestSent(function(oEvent2) {
				controller.getView().setBusyIndicatorDelay(1);
				controller.getView().setBusy(true);
			});

			oModel.attachRequestCompleted(function() {
				controller.getView().setBusy(false);
			});

			oModel.attachRequestFailed(function() {
				controller.getView().setBusy(false);
			});
			
			//jQuery.sap.log.debug(oModel);
			
			// parametro do OData do Plano
			var dueDateObj = this.byId("dueDate").getDateValue();
			var dateGMT = new Date(dueDateObj.getTime() + Math.abs(dueDateObj.getTimezoneOffset() * 60000));
			
			// get user logged
			var name = controller.getUserLogginData().name;  

			var oEntry = {};
			oEntry.id = "0";
			oEntry.dueDate = "/Date(" + dateGMT.getTime() + ")/"; // epoch format.
			oEntry.description = planName;
			oEntry.createdBy = name; // user logged
			
			// executa o serviço
			oModel.create("/Plan", oEntry, {
				success: function(oData, response) {
					controller.getRouter().navTo("detailsPlan", { planDescription: planName });
				}, 
				error: function(oError) {
					//var errorObj1 = controller.xmlToJson(oError.response.body);
					var errorObj1 = JSON.parse(oError.responseText);
					sap.m.MessageBox.show(
						errorObj1.error.message.value,
						sap.m.MessageBox.Icon.ERROR,
						"Error In Operation"
						);
					}
				}
			);
		},
		
		handleRouteMatched : function (evt) {
			//Check whether is the detail page is matched.
	   		if (evt.getParameter("name") == "planList"){
		    	this.byId("planName").setValue("");
			 	this.byId("dueDate").setValue("");
			}
    	},
    	
    	just4Testing: function(input) {
    		return input;
    	}
	});
});
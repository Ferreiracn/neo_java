sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"acn/logistics/PurchasingPlanCockpit/model/formatter",
	"sap/m/MessageToast",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/ui/core/format/NumberFormat',
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller'
	
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast,
	Button,
	Dialog,
	NumberFormat,jQuery, Controller
) {
	"use strict";
	
	return BaseController.extend("acn.logistics.PurchasingPlanCockpit.controller.planList", {
		formatter: formatter,
		
		onInit: function() {

			this.getView().setBusyIndicatorDelay(10);
			this.getView().setBusy(true);
			
			
			var controller = this;
			var templateTile = new sap.m.StandardTile("tileTemplate",{
				icon: "sap-icon://expense-report",
				number: "{id}",
				numberUnit: "{path:'dueDate', type: 'sap.ui.model.type.Date' , formatOptions: { style: 'short' }}",
				title: "{description}",
				info: "{parts:[ {path: 'totalCost'}, {path: 'currency'} ], type: 'sap.ui.model.type.Currency' , formatOptions: { 	showMeasure: true, currencyCode: false, currencyContext: 'standard'}}",
				editable: true,
				press: [
					function(oEvent) {
					var planDesc = oEvent.getSource().getTitle();
					this.getRouter().navTo("detailsPlan", { planDescription: planDesc });
					}, controller]
             }).addStyleClass("tileStyle"); 
		
			var oModel = new sap.ui.model.odata.v2.ODataModel(
				"/acn/logistics/purchasingplancockpit/d/service/Plan.xsodata",{useBatch: true});
			oModel.setSizeLimit(999999);
			this.getView().setModel(oModel);
			
			oModel.attachRequestSent(function(oEvent2) {
				controller.getView().setBusyIndicatorDelay(100);
				controller.getView().setBusy(true);
			});
			oModel.attachRequestCompleted(function() {
				controller.getView().setBusy(false);
				// Check the number of plans, and show a "No Data." screen insted of the tile container
				var PlansNum = Object.keys(this.getProperty("/")).length;
				if (PlansNum == 0){
					controller.getView().byId("tileContainer").setVisible(false);
					controller.getView().byId("noDataMsg").setVisible(true);
				} else {
					controller.getView().byId("tileContainer").setVisible(true);
					controller.getView().byId("noDataMsg").setVisible(false);
				}
			});
			oModel.attachRequestFailed(function(oEvent) {
				/*
				message: oEvent.getParameter("message"),
            	responseText:oEvent.getParameter("responseText"),
            	statusCode:oEvent.getParameter("statusCode"),
            	statusText:oEvent.getParameter("statusText")
				*/
				controller.getView().setBusy(false);
				sap.m.MessageBox.show(
					oEvent.getParameter("message"),
					sap.m.MessageBox.Icon.ERROR,
					"Error In Operation"
				);
			});
				
			var tileContainer = this.getView().byId("tileContainer");
			tileContainer.setModel(oModel);
			tileContainer.bindAggregation("tiles",{
			    path: "/Plan",
			    template: templateTile,
			    parameters: { select: "id,description,dueDate,totalCost,currency"}
			});
		
			this.getRouter("planList").attachRouteMatched(this.handleRouteMatched, this);
			
			
		},
		
		handleEditPress : function (evt) {
			var oTileContainer = this.getView().byId("tileContainer");
			var newValue = ! oTileContainer.getEditable();
			oTileContainer.setEditable(newValue);
		},
		
		handleTileDelete : function (evt) {
			var tile = evt.getParameter("tile");
			evt.getSource().removeTile(tile);
		},
		
		
		handleNav: function(evt) {
			var navCon = this.getView().byId("navCon");
			var target = evt.getSource().data("target");
			navCon.to(this.getView().byId(target), "slide");
		},
		
		addPlan: function() {
			this.getRouter().navTo("newPlan", {});
		},
		
		onNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("planList", {}, bReplace);
			}
		},
		
		handleRouteMatched : function (evt) {
			// Check whether is the detail page is matched.
    		if (evt.getParameter("name") == "planList") {
	    		var oModel = this.getView().getModel();
				oModel.refresh();
    		}
		}
	});
});

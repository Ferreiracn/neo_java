sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("acn.logistics.PurchasingPlanCockpit.controller.App", {
		
		onInit: function() {
			// user login data
			/* Login fields:
				name
				firstName
				lastName
				displayName
				email
			*/
			var	oModelUser = new sap.ui.model.json.JSONModel();
			oModelUser.loadData("/services/userapi/currentUser", "", false);
			//sap.ui.getCore().setModel(oModelUser, "userapi");
			this.setModel(oModelUser, "userapi");
			
			//var oViewModel,
			//	fnSetAppNotBusy,
			//	iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			//oViewModel = new JSONModel({
			//	busy: true,
			//	delay: 0
			//});
			//this.setModel(oViewModel, "appView");

			//fnSetAppNotBusy = function() {
			//	oViewModel.setProperty("/busy", false);
			//	oViewModel.setProperty("/delay", iOriginalBusyDelay);
			//};

			//this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});
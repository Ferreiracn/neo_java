sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"acn/logistics/PurchasingPlanCockpit/model/formatter",
	"sap/m/MessageToast"
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast
) {
	"use strict";

	return BaseController.extend("acn.logistics.PurchasingPlanCockpit.controller.ObjectPlanning", {

		onInit: function() {

			var oModelMaterial = new sap.ui.model.json.JSONModel();
			var groupmaterial = [{
				text: "Grupo Material 1",
				key: "MAT1",
				procedureName: "GMAT1"
			}, {
				text: "Grupo Material 2",
				key: "MAT2",
				procedureName: "GMAT2"
			}, {
				text: "Grupo Material 3",
				key: "MAT3",
				procedureName: "GMAT3"
			}];
			oModelMaterial.setProperty("/groupmaterial", groupmaterial);
			this.getView().setModel(oModelMaterial, "materialModel");
			
			var oModelMethods = new sap.ui.model.json.JSONModel();
			var methods = [{
				text: "Mean",
				key: "MEAN",
				procedureName: "MeanProcedure"
			}, {
				text: "Polynomial Regression",
				key: "POLY",
				procedureName: "PolyProcedure"
			}, {
				text: "Editable",
				key: "EDIT",
				procedureName: "EditProcedure"
			}];
			oModelMethods.setProperty("/methods", methods);
			this.getView().setModel(oModelMethods, "methodsModel");
		}

	});
});
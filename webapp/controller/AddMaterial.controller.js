sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"acn/logistics/PurchasingPlanCockpit/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"acn/logistics/PurchasingPlanCockpit/model/formatter",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function(
		Controller,
		BaseController,
		JSONModel,
		History,
		formatter,
		MessageToast,
		Filter,
		FilterOperator
	) {
		"use strict";
	
	var selectedProduct = [];
	var oModelselectedProduct = new sap.ui.model.json.JSONModel();
	
	return BaseController.extend("acn.logistics.PurchasingPlanCockpit.controller.AddMaterial", {

	onInit: function() {
		
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Material Category DB
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var oModelProductCat = new sap.ui.model.json.JSONModel();
			var productCategory = [{
							id: "1",
							name: "Material Technology"
						}, {
							id: "2",
							name: "Material Office"
						}, {
							id: "3",
							name: "Material Garage"
						}, {
							id: "4",
							name: "Material Others"
					}];
			oModelProductCat.setProperty("/ProductCategory", productCategory) ;
			this.getView().setModel(oModelProductCat, "category"); //category>/ProductCategory
					
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Products DB
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var oModelProductList = new sap.ui.model.json.JSONModel();
			var ProductList = [{
							category: "1",
							product: "PC Screen" 
						},{ 
							category: "1",
							product: "LAPTOP" 
						}, {
							category: "1",
							product: "Mouse" 
						}, {
							category: "2",
							product: "Pen"
						}, {
							category: "2",
							product: "Rubber"
						}, {
							category: "2",
							product: "Ruller"
						}, {
							category: "2",
							product: "Pencil"
						}, {
							category: "3",
							product: "Piston"
						}, {
							category: "3",
							product: "Brake Pad"
						}, {
							category: "3",
							product: "oRings"
						}, {
							category: "4",
							product: "Glass"
						}, {
							category: "4",
							product: "Wood"
						}, {
							category: "4",
							product: "Steel"
						}, {
							category: "4",
							product: "Iron"
						}];
			oModelProductList.setProperty("/List", ProductList);
			this.getView().setModel(oModelProductList, "productList");
			
			var categoryId = 1; // Filter the first Material Group showed on the SelectBox
			var aFilter = []; 
			aFilter.push(new Filter("category", FilterOperator.EQ, categoryId));
			
			var oList = this.getView().byId("productList1"); // Biding to "productTable"
			var oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
			
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Products 2 DB
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			//var oModelselectedProduct = new sap.ui.model.json.JSONModel();
			//this.getView().setModel(oModelselectedProduct, "selectedProduct"); //selectedProduct>/Product
			
	},
	
	onChange: function (oEvent){
		var categoryId = this.byId("comboBox1").getSelectedKey();
		
		var aFilter = []; // Filter
		aFilter.push(new Filter("category", FilterOperator.EQ, categoryId));
		
		var oList = this.getView().byId("productList1"); // Biding to "productTable"
		var oBinding = oList.getBinding("rows");
		oBinding.filter(aFilter);
	},
	
	onSearch: function (oEvent){
		
		var aFilter = []; // build filter array
		var sQuery = oEvent.getParameter("query");

		if (sQuery == ""){
			
			var categoryId = this.byId("comboBox1").getSelectedKey(); // If search returns empty, shows all the Category Products
			var aFilter = []; 	
			aFilter.push(new Filter("category", FilterOperator.EQ, categoryId));
			
			var oList = this.getView().byId("productList1"); // Biding to "productList1"
			var oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
			
		} else {
	
			aFilter.push(new Filter("product", FilterOperator.Contains, sQuery));
			var oList = this.getView().byId("productList1");
			var oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);	
		}
	},
	
	onSelectionChange: function(oEvent){
		
		/* NOT WORKING */ 
		
		var iIndex = this.byId("productList1").getSelectedIndex();
		
		var product = this.byId("productList1").getContextByIndex(iIndex).oModel.oData.List[iIndex];
		
		var categoryId = this.byId("comboBox1").getSelectedKey();
		
		selectedProduct.push(product);
		
	},  
		
	onPressInsert: function(oEvent){
			// var oTable = this.getView().byId("productList1");
			// var iIndex = oTable.getSelectedIndex();
			// var sMsg;
			// if (iIndex < 0) {
			// 	sMsg = "no item selected";
			// } else {
			// 	sMsg = oTable.getContextByIndex(iIndex);
			// }
			// MessageToast.show(sMsg);
		

		oModelselectedProduct.setProperty("/Product", selectedProduct);
		this.getView().setModel(oModelselectedProduct, "selectedProduct");

	},
	
	onPressDelete: function(){
		var aIndices = this.getView().byId("productList2").getSelectedIndices();
		var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			MessageToast.show(sMsg);
	},
	
	
	
	
	handleLiveChangePriceUnit: function(oEvent) {
	
	},
	
	handleLiveChangeQuantity: function(oEvent) {
		
	},
	
	onNavBack: function() {
		window.history.go(-1);
	}
		
	});
});
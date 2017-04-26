jQuery.sap.require("acn.logistics.PurchasingPlanCockpit.formatters.Formatter");

sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"acn/logistics/PurchasingPlanCockpit/model/formatter",
	"sap/m/MessageToast",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/ui/core/format/NumberFormat'
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast,
	Button,
	Dialog,
	NumberFormat
) {
	"use strict";

	var xhrExport;

	return BaseController.extend("acn.logistics.PurchasingPlanCockpit.controller.DetailedPlan", {

		formatter: formatter,

		onInit: function() {

			jQuery.sap.require("sap.ui.core.util.Export");
			jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detailsPlan").attachPatternMatched(this._onObjectMatched, this);

			var oModelMethods = new sap.ui.model.json.JSONModel();
			var methods = [{
				text: this.getResourceBundle().getText("lastYear_dropdown"),
				key: "LTY",
				procedureName: "LastYearProcedure"
			}, {
				text: this.getResourceBundle().getText("mean_dropdown"),
				key: "AVG",
				procedureName: "MeanProcedure"
			}, {
				text: this.getResourceBundle().getText("linreg_dropdown"),
				key: "LRG",
				procedureName: "PolyProcedure"
			}, {
				text: this.getResourceBundle().getText("editable_dropdown"),
				key: "MNL",
				procedureName: "EditProcedure"
			}];
			oModelMethods.setProperty("/methods", methods);
			this.getView().setModel(oModelMethods, "methodsModel");

			var oModelModifications = new JSONModel();
			this.getView().setModel(oModelModifications, "modelModifications");

		},

		onTopDropdownChange: function(oEvent) {
			/*******************************************
			 * Change the dropdown values of this plan * 
			 *******************************************/
			var oController = this;
			var oModel = this.getView().getModel("tableModel");
			var PlanModel = this.getView().getModel("PlanModel");
			var planId = PlanModel.getProperty("/id");
			var property = PlanModel.getProperty("/");
			delete property.MaterialGroupItem;
			delete property['PlanHeader(' + planId + ')'];

			//Change the oData Model's planning method property
			oModel.setProperty("/PlanHeader(" + planId + ")/planningMethod", property.planningMethod);

			oModel.update("/PlanHeader(" + planId + ")", property, {
				success: function(oData) {
					oModel.read("/PlanHeader(" + planId + ")", {
						parameters: "id,description,dueDate,planningMethod,currency,totalCost,totalCostLastYear,totalCostAvg,percentageLastYear,percentage3Year",
						success: function(oData) {
							PlanModel.setProperty("/", oModel.getProperty("/PlanHeader(" + planId + ")"));
						},
						error: function(oError) {
							var error = JSON.parse(oError.responseText);
							oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
						}
					});
					for (var key in oModel.oData) {
						oModel.read("/" + key);
					}
				},
				error: function(oError) {
					var error = JSON.parse(oError.responseText);
					oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
				}
			});
		},

		onTableDropdownChange: function(oEvent) {
			var oController = this;
			var dropdownId = oEvent.getSource().getId();
			var dropdown = this.getView().byId(dropdownId);
			var key = dropdown.getSelectedKey();
			var row = dropdown.getParent();
			var hbox = row.getCells()[5];
			var oModel = this.getView().getModel("tableModel");
			var PlanModel = this.getView().getModel("PlanModel");
			var path = oEvent.getSource().getBindingContext("tableModel").getPath();
			var isMaterial = path.includes("MaterialPlanResponsibleItem");

			// Material
			if (isMaterial) {

				var property = oModel.getProperty(path);
				oModel.update(path, property, {
					success: function(oData) {
						oModel.read(path);
						oModel.read("/MaterialGroupItem(" + property.materialGroupId + ")");
						oModel.read("/PlanHeader(" + PlanModel.getProperty("/id") + ")", {
							parameters: "id,description,dueDate,planningMethod,currency,totalCost,totalCostLastYear,totalCostAvg,percentageLastYear,percentage3Year",
							success: function(oData) {
								PlanModel.setProperty("/", oModel.getProperty("/PlanHeader(" + PlanModel.getProperty("/id") + ")"));
							},
							error: function(oError) {
								var error = JSON.parse(oError.responseText);
								oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
							}
						});
					},
					error: function(oError) {
						var error = JSON.parse(oError.responseText);
						oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
					}
				});

				// Material Group
			} else {
				var property = oModel.getProperty(path);

				delete property.MaterialPlanResponsibleItem;
				oModel.update(path, property, {
					success: function(oData) {
						oModel.read(path);
						oModel.read("/PlanHeader(" + PlanModel.getProperty("/id") + ")", {
							parameters: "id,description,dueDate,planningMethod,currency,totalCost,totalCostLastYear,totalCostAvg,percentageLastYear,percentage3Year",
							success: function(oData) {
								PlanModel.setProperty("/", oModel.getProperty("/PlanHeader(" + PlanModel.getProperty("/id") + ")"));
							}
						});
						for (var key in oModel.oData) {
							if (key.includes("materialGroupId=" + property.id))
								oModel.read("/" + key);
						}
					},
					error: function(oError) {
						var error = JSON.parse(oError.responseText);
						oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
					}
				});
			}
		},

		onNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var bReplace = true;
			// if (sPreviousHash !== undefined) {
			// 	// The history contains a previous entry
			// 	history.go(-1);
			// } else {
			// 	// Otherwise we go backwards with a forward history
			// 	var bReplace = true;
				this.getRouter().navTo("planList", {}, bReplace);
			// }
		},

		onAddrow: function() {
			this.getRouter().navTo("addMaterial", {});
		},

		onSearch: function(oEvent) {

			var oController = this;
			var aFilters = [];
			var newValue = oEvent.getSource("value").getValue();
			var oModel = this.getView().getModel("tableModel");
			var PlanModel = this.getView().getModel("PlanModel");
			var PlanId = PlanModel.getProperty("/id");
			var oFilterDescription = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, newValue);
			var oFilterPlanId = new sap.ui.model.Filter("planId", sap.ui.model.FilterOperator.EQ, PlanId);

			if (newValue !== "") {
				var sQueryLower = newValue.toLowerCase();

				var sQueryUpper = newValue.toUpperCase();

				var sQueryUpLow = newValue[0].toUpperCase() + newValue.substr(1).toLowerCase();

			};

			aFilters.push(new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQueryLower));

			aFilters.push(new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQueryUpper));

			aFilters.push(new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQueryUpLow));

			aFilters.push(oFilterDescription);
			aFilters.push(oFilterPlanId);

			var oTable = this.getView().byId("TreeTableBasic");

			if (newValue == '') {
				oTable.bindRows({
					path: "tableModel>/PlanHeader(" + PlanId + ")/MaterialGroupItem",
					parameters: {
						navigation: {
							"MaterialGroupItem": "MaterialPlanResponsibleItem"
						}
					}
				});
				return;
			}

			oTable.bindRows({
				path: "tableModel>/MaterialPlanResponsibleItem",
				filters: aFilters,
				parameters: {
					navigation: {
						"MaterialGroupItem": "MaterialPlanResponsibleItem"
					}
				}
			});
		},

		onExport: function() {
			var oModel = this.getView().getModel("PlanModel");
			// keys para filtro do export
			var planId = oModel.getProperty("/id");

			var filename = "MaterialPlanResponsible-" + planId + ".xlsx";

			// dados para a rotina de export
			var schema = "\"ACN_LOGISTICS_PURCHASINGPLANCOCKPIT_D\"";
			var table = "\"acn.logistics.purchasingplancockpit.d.data::MainEntities.V_MaterialPlanResponsibleGroupExport\"";
			var params = "?$filter=\"Plan\"%20eq%20" + planId + "&$format=xlsx&download=" + filename;

			this.downloadWorkbook(schema, table, params, filename);
		},

		downloadWorkbook: function(schema, table, params, filename) {
			var controller = this;
			// Library obtida em https://blogs.sap.com/2016/05/03/odxl-an-open-source-data-export-layer-for-saphana-based-on-odata/
			xhrExport = new XMLHttpRequest();
			var odxlServiceEndpoint = "/acn/logistics/purchasingplancockpit/d/odxl/odxl.xsjs";
			var serviceParams = "/" + schema + "/" + table + params;
			xhrExport.open("GET", odxlServiceEndpoint + serviceParams, true);

			//http://www.html5rocks.com/en/tutorials/file/xhr2/
			//http://jsfiddle.net/koldev/cw7w5/
			xhrExport.responseType = "blob";
			xhrExport.onload = function() {
				if (this.status !== 200) {
					controller._dialog.close();
					sap.m.MessageBox.show(
						"Error: " + this.statusText + "\n" + String.fromCharCode(this.response),
						sap.m.MessageBox.Icon.ERROR,
						"Error In Operation"
					);
					return;
				}
				var blob = this.response;
				var url = window.URL.createObjectURL(blob);
				var a = document.createElement("a");
				a.style = "display: none";
				a.href = url;
				a.download = filename;
				$(a).appendTo("body");
				a.click();
				window.URL.revokeObjectURL(url);

				// finaliza o waiting screen
				controller._dialog.close();
			};
			//TODO: Verificar timeout do HANA XS (https://archive.sap.com/discussions/thread/3325292)
			xhrExport.timeout = 90000;
			xhrExport.ontimeout = function() {
				// finaliza o waiting screen
				controller._dialog.close("cancelPressed");

				sap.m.MessageBox.show(
					"Timeout on exporting data!",
					sap.m.MessageBox.Icon.ERROR,
					"Error In Operation"
				);
				return;
			};

			controller.onOpenExportDialog();
			xhrExport.send();
		},

		_onObjectMatched: function(oEvent) {
			this.getView().setBusy(true);

			var oController = this;
			var planDescription = oEvent.getParameter("arguments").planDescription;
			var oTable = this.getView().byId("TreeTableBasic");

			var oModel = new sap.ui.model.odata.v2.ODataModel(
				"/acn/logistics/purchasingplancockpit/d/service/PlanMaterialResponsible.xsodata", {
					useBatch: true,
					refreshAfterChange: false
				});

			var descriptionFilter = new sap.ui.model.Filter({
				path: "description",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: planDescription
			});
			var filters = new Array();
			filters.push(descriptionFilter);

			oModel.read("/PlanHeader", {
				parameters: "id,description,dueDate,planningMethod,currency,totalCost,totalCostLastYear,totalCostAvg,percentageLastYear,percentage3Year",
				filters: filters,
				success: fSuccess,
				error: fError
			});

			// Attach some events to the oData Model -> needed to control the busy indicator based on the oData Requests
			oModel.attachRequestSent(function(oEvent) {
				oTable.setBusyIndicatorDelay(10);
				oTable.setBusy(true);
			});

			oModel.attachRequestCompleted(function(oEvent) {

				if (oEvent.getParameter('response').statusText != "OK" && oEvent.getParameter('response').statusText != "No Content") {
					var error = JSON.parse( oEvent.getParameter('response').responseText );
					oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
					oTable.setBusy(false);
					oController.getView().setBusy(false);
				}

				//The busy indicator should not be hidden when updating the DB, because after this the FE will retrieve all the changes again
				if (oEvent.getParameter("method") != "MERGE" && oEvent.getParameter('response').statusText == "OK") {
					oTable.setBusy(false);
					oController.getView().setBusy(false);
				}
			});

			oModel.attachRequestFailed(function(oEvent) {
				oTable.setBusy(false);
				oController.getView().setBusy(false);
			});

			function fSuccess(oData) {

				if (oData.results.length == 0) {
					return;
				}
				var id = oData.results[0].id;
				var controller = oController; //Needed in order to be accessed by .attachRequestCompleted

				var path;
				oTable.bindRows({
					path: "tableModel>/PlanHeader(" + id + ")/MaterialGroupItem",
					parameters: {
						navigation: {
							"MaterialGroupItem": "MaterialPlanResponsibleItem"
						},
					}

				});

				oModel.setDefaultBindingMode("TwoWay");
				oController.getView().setModel(oModel, "tableModel");

				//Model Plan - In order to get the Plan Id and Description statically
				var oModelPlan = new JSONModel();
				oModelPlan.setData(oData.results[0]);
				oController.getView().setModel(oModelPlan, "PlanModel");

				//Everytime that the Plan properties are changed, change also in the oDataModel to be coherent
				oModelPlan.attachPropertyChange(function(oEvent) {
					var value = oEvent.getParameter("value");
					oController.getView().getModel("tableModel").setProperty("/PlanHeader(" + id + ")/planningMethod", value);
				});
			};

			function fError(oError) {
				var oTable = oController.getView().byId("TreeTableBasic");
				oTable.setBusy(false);

				var error = JSON.parse(oError.responseText);
				oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);
			};
		},

		onOpenExportDialog: function(oEvent) {
			// instantiate dialog
			if (!this._dialog) {
				this._dialog = sap.ui.xmlfragment("acn.logistics.PurchasingPlanCockpit.fragment.BusyDialog", this);
				this.getView().addDependent(this._dialog);
			}

			// open dialog
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
			this._dialog.open();
		},

		onDialogClosed: function(oEvent) {
			if (oEvent.getParameter("cancelPressed")) {
				xhrExport.abort();
				MessageToast.show("The export has been cancelled");
			} else {
				MessageToast.show("The export has been completed");
			}
		},
		

		
		/* Sorry about this, pals! */
		onChangeManualInput: function(oEvent) {

			var tableInputField = oEvent.getSource();
			var oController = this;
			var tablePath = oEvent.getSource().getBindingContext("tableModel").getPath();
			var tableInput = Math.round(oEvent.getSource().getValue());

			//If negative value send error message
			if (tableInput < 0) {
				oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, "Negative quantities are not valid!");
				return;
			}
			
			//Create the dialog Object
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("acn.logistics.PurchasingPlanCockpit.fragment.costObjectPopup", this);
			}

			var dialog = this._oDialog;
			var dialogTable;
			dialogTable = this._oDialog.getContent()[1];
			dialogTable.setBusy(true);
			dialogTable = this._oDialog.getContent()[1];
			this.getView().addDependent(this._oDialog);

			//Model to be used for TotalCost in the Popup
			var oModelPopup = new JSONModel();
			this.getView().setModel(oModelPopup, "popupModel");
			oModelPopup.setProperty("/title", this.getView().getModel("tableModel").getProperty(tablePath + "/description"));

			//ModelPlan (used on top)
			var oModelPlan = oController.getView().getModel("PlanModel");

			var oModel = new sap.ui.model.odata.v2.ODataModel(
				"/acn/logistics/purchasingplancockpit/d/service/MaterialPlanCostObject.xsodata", {
					useBatch: true
				});
			oModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(oModel, "costObjectModel");

			//Change totalquantity model everytime a modification in the quantity of the cost object occurs
			oModel.attachPropertyChange(function(oEvent) {
				var totalQuantity = 0;
				for (var key in this.oData) {
					if (key.includes("materialNumber='" + property.materialNumber + "'")) {
						totalQuantity += Math.round(this.getProperty("/" + key + "/plannedQuantity"));
					}
				}
				oModelPopup.setProperty("/totalQuantity", totalQuantity);
			});

			oModel.attachRequestSent(function(oEvent) {
				dialogTable.setBusyIndicatorDelay(10);
				dialogTable.setBusy(true);
			});

			oModel.attachRequestCompleted(function(oEvent) {
				var property = oController.getView().getModel("tableModel").getProperty(tablePath);

				//Only enter when is updated
				if (oEvent.getParameter("method") == "MERGE" && oEvent.getParameter('response').statusCode == "204") {
					var tableModel = oController.getView().getModel("tableModel");
					var totalQuantity = 0;
					for (var key in this.oData) {
						if (key.includes("materialNumber='" + property.materialNumber + "'")) {
							var thisProperty = this.getProperty("/" + key);
							totalQuantity += Math.round(thisProperty.plannedQuantity);
						}
					}
					//Refresh Material, Material Group and Plan in order to update the total values
					tableModel.read("/MaterialPlanResponsibleItem(materialNumber='" + thisProperty.materialNumber + "',planId=" + thisProperty.planId +
						",materialGroupId=" + thisProperty.materialGroupId + ")");
					tableModel.read("/MaterialGroupItem(" + thisProperty.materialGroupId + ")");
					tableModel.read("/PlanHeader(" + thisProperty.planId + ")", {
						parameters: "id,description,dueDate,planningMethod,currency,totalCost,totalCostLastYear,totalCostAvg,percentageLastYear,percentage3Year",
						success: function(oData) {
							oModelPlan.setProperty("/", oController.getView().getModel("tableModel").getProperty("/PlanHeader(" + oModelPlan.getProperty(
								"/id") + ")"));
						}
					});
					tableInputField.setValue(totalQuantity);
					dialogTable.setBusy(false);
					dialog.close();
					
				//Only enter when is reading 
				} else if (oEvent.getParameter('response').statusText == "OK") {
					var totalQuantity = 0;
					for (var key in this.oData) {
						if (key.includes("materialNumber='" + property.materialNumber + "'")) {
							var percentage = Number(this.getProperty("/" + key + "/quantitySumPerc"));
							var result = percentage * tableInput;
							totalQuantity += Math.round(result);
							this.setProperty("/" + key + "/plannedQuantity", Math.round(result).toString());
						}
					}
					oModelPopup.setProperty("/totalQuantity", totalQuantity);
					dialogTable.setBusy(false);
				} else {
						
					var error = JSON.parse( oEvent.getParameter('response').responseText );
					oController.showErrorMsg("Error", sap.ui.core.ValueState.Error, error.error.message.value);

					dialogTable.setBusy(false);
					oController.getView().setBusy(false);
				}
			});

			oModel.attachRequestFailed(function(oEvent) {
				dialogTable.setBusy(false);
				oController.getView().setBusy(false);
			});

			var tableModel = this.getView().getModel("tableModel");
			var path = oEvent.getSource().getBindingContext("tableModel").getPath();
			var property = tableModel.getProperty(path);
			var bindingFilters = new sap.ui.model.Filter({
				and: true,
				filters: [

					new sap.ui.model.Filter({
						path: "materialNumber",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: property.materialNumber
					}),
					new sap.ui.model.Filter({
						path: "materialGroupId",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: property.materialGroupId
					}),
					new sap.ui.model.Filter({
						path: "planId",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: property.planId
					})
				]
			});

			dialogTable.bindItems({
				path: "costObjectModel>/MaterialPlanCostObject",
				filters: bindingFilters,
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({
							text: "{costObjectModel>costObject}"
						}),

						new sap.m.Input({
							textAlign: "Right",
							value: {
								path: "costObjectModel>plannedQuantity"
							}
						})
					]
				})
			});

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleClosePopUp: function(oEvent) {
			if (this._oDialog) {
				this._oDialog.close();
			}
		},

		onPressPopupSave: function(oEvent) {
			var oModel = this.getView().getModel("costObjectModel");
			oModel.submitChanges();

		}
	});
});

/****************************** 
*	Happy Easter to everyone! *
*******************************
* 
                    ____     ____
                  /'    |   |    \
                /    /  |   | \   \
              /    / |  |   |  \   \
             (   /   |  """"   |\   \       Ahhh HA!!!
             | /   / /^\    /^\  \  _|           I love big bigcarrot!!!
              ~   | |   |  |   | | ~
                  | |__O|__|O__| |
                /~~      \/     ~~\
               /   (      |      )  \
         _--_  /,   \____/^\___/'   \  _--_
       /~    ~\ / -____-|_|_|-____-\ /~    ~\
     /________|___/~~~~\___/~~~~\ __|________\
--~~~          ^ |     |   |     |  -     :  ~~~~~:~-_     ___-----~~~~|
   /             `^-^-^'   `^-^-^'                  :  ~\ /'   ____/----|
       --                                            ;   |/~~~------~~~~~|
 ;                                    :              :    |------/--------|
:                     ,                           ;    .  |---\\----------|
 :     -                          .                  : : |__________-__|
  :              ,                 ,                :   /'~----_______|
__  \\\        ^                          ,, ;; ;; ;._-~
  ~~~-----____________________________________----~~~
  
  */
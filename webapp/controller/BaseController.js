sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text',
	'jquery.sap.global'
], function(
	Controller,
	History,
	Button,
	Dialog,
	Text,
	jQuery
	) {
	"use strict";

	return Controller.extend("acn.logistics.PurchasingPlanCockpit.controller.BaseController", {
		
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				//****************************
				//*  Needs to be reviewed!!  *
				//****************************
				this.getRouter().navTo("appHome", {}, true /*no history*/ );
			}
		},
		
		// buzyDelayOpen: function (){
		// 	var oDialog = this.getView().byId("BusyDialog");
		// 	oDialog.open();
		// },
		
		
		/**
		 * Busy Indicator loading something
		 */
		hideBusyIndicator : function() {
			sap.ui.core.BusyIndicator.hide();
		},
		showBusyIndicator : function (iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);
 
			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					jQuery.sap.clearDelayedCall(this._sTimeoutId);
					this._sTimeoutId = null;
				}
 
				this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function() {
					this.hideBusyIndicator();
				});
			}
		},
		/**
		 * Show Error Message
		 */
		showErrorMsg: function(title,state,message){
			var dialog = new Dialog({
				title: title,
				type: 'Message',
				state: state,
				content: new Text({
					text: message
				}),
				
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
 
			dialog.open();
		},
		
		parse: function(node, j) {
			var controller = this;
			var nodeName = node.nodeName.replace(/^.+:/, '').toLowerCase();
			var cur = null;
			var text = $(node).contents().filter(function(x) {
				return this.nodeType === 3;
			});
			if (text[0] && text[0].nodeValue.trim()) {
				cur = text[0].nodeValue;
			} else {
				cur = {};
				$.each(node.attributes, function() {
					if (this.name.indexOf('xmlns:') !== 0) {
						cur[this.name.replace(/^.+:/, '')] = this.value;
					}
				});
				$.each(node.children, function() {
					controller.parse(this, cur);
				});
			}
			j[nodeName] = cur;
		},

		xmlToJson : function (xml) {
			var roots = $(xml);
			var root = roots[roots.length - 1];
			var json = {};
			this.parse(root, json);

			return json;
		},
		
		getUserLogginData: function() {
			var oModelUser = this.getModel("userapi");
			//return oModelUser.getJSON();
			return oModelUser.oData;
		},
		
		logUserOut: function(){
    		sap.m.URLHelper.redirect("logout.html", false);
		}
	});
});
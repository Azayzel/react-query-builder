import React, { Component } from "react";
import * as UIkit from "uikit";
import { ReportItem } from "../classes/ReportSet";
import "../query-tree.css";
import { Lock, Unlock, Trash } from './Icons';

/**
 * The Condition component which uses internal state to show the Operators
 *  and value input once a column is selected. Component can be deleted from it's
 *  parent.
 * @param {*} props QueryColumns, Operators, CountryList, LastUpdatedUser, OnConditionalAdd, OnCapturedValue, OnRemoveCondition
 */
export class QueryCondition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Parent GroupId used to pass conditional back to this group
      groupId: this.props.Group.groupId,

      // Filtered Operators based on what column was selected
      filteredOperators: this.props.Operators,

      // Show Operator select input and value input
      didSelectColumn: false,

      // Show Input when operator is selected
      didSelectOperator: false,

      // Show save and delete when value is saved
      didSetValue: false,

      // Apply Green backdrop when saved/ done editing
      editing: true,

      // State props if 'between' operator selected, date range
      showDateRangeModal: false,
      fromDate: null,
      toDate: null,

      // List of Last Updated users if that column is selected
      lastUpdatedUsers: this.props.LastUpdatedUsers,

      // Country list
      countries: this.props.CountryList,

      // Current Column
      selectedCol: null,

      // Selected Operator
      selectedOper: null,

      // Selected Value
      selectedVal: null,

      // All conditions in this group
      conditions: []
    };
  }

  setShowOperator = () => {
    this.setState({ didSelectColumn: true });
  };

  showDateRangeScheduler = e => {
    this.setState({ showDateRangeModal: true });
    setTimeout(() => {
      UIkit.modal("#dateRange-modal").show();
    }, 500);
  };

  closeModal = modal => {
    UIkit.modal(modal).hide();
  };

  handleOptionSelect = e => {
    let val = e.target.value;
    this.setState({ didSelectColumn: true, selectedCol: val });

    // Check if column is country, last updated user or date so we can filter operators
  };

  handleOperatorSelect = e => {
    let val = e.target.value;
    this.setState({ selectedOper: val, didSelectOperator: true });
  };

  handleDateRangeSave = (e, from, to) => {
    e.preventDefault();
    UIkit.modal("#dateRange-modal").hide();
  };

  handleValueChange = e => {
    // On new value, send to parent all elements as a ReportItem
    let value = e.target.value;

    this.setState({ didSetValue: true, selectedVal: value });
  };

  saveConditional = e => {
    e.preventDefault();
    this.setState({ editing: false });
    let { groupId, selectedCol, selectedOper, selectedVal } = this.state;
    let reportItem = new ReportItem(
      groupId,
      selectedCol,
      selectedOper,
      selectedVal
    );
    // Call parent to push changes up
    this.props.OnSaveCondition(reportItem);
  };

  editConditional = e => {
    e.preventDefault();
    this.setState({ editing: true });
  };

  deleteConditional = e => {
    e.preventDefault();
  };

  render() {
    return (
      <div className="uk-grid-small uk-width-1-1" uk-grid="true">
        <div className="uk-width-1-4">
          <select className="uk-select" onChange={this.handleOptionSelect}>
            <option
              value={null}
              selected={true}
              disabled={true}
              className="uk-text-meta uk-text-italic"
            >
              Select a field...
            </option>
            {this.props.QueryColumns.map((c, i) => {
              return (
                <option key={i} value={c.name}>
                  {c.title}
                </option>
              );
            })}
          </select>
        </div>

        {this.state.didSelectColumn ? (
          <div className="uk-width-3-4 uk-grid">
            <div className="uk-width-1-3">
              <select
                className="uk-select uk-margin-small uk-animation-slide-right"
                placeholder="Operator"
                defaultChecked="Select an Operator"
                onChange={this.handleOperatorSelect}
              >
                <option
                  value={null}
                  selected={true}
                  disabled={true}
                  className="uk-text-meta uk-text-italic"
                >
                  Select an Operator...
                </option>
                {this.props.Operators.map((o, i) => {
                  return (
                    <option
                      key={i}
                      value={o.oper}
                      selected={o.title === "Equals"}
                    >
                      {o.title}
                    </option>
                  );
                })}
              </select>
            </div>
            {this.state.didSelectOperator ? (
              <div className="uk-width-1-3">
                {this.state.selectedCol == "country_id_id" ? (
                  <select
                    className="uk-select uk-margin-small uk-animation-slide-right"
                    name="selectedVal"
                    onChange={this.handleValueChange}
                  >
                    {this.state.countries.map((c, j) => {
                      return (
                        <option key={j} value={c.id}>
                          {c.long_name}
                        </option>
                      );
                    })}
                  </select>
                ) : this.state.selectedCol == "last_updated_user" ? (
                  <select
                    className="uk-select uk-margin-small uk-animation-slide-right"
                    name="selectedVal"
                    onChange={this.handleValueChange}
                  >
                    {this.state.lastUpdatedUsers.map((u, i) => {
                      return (
                        <option key={i} value={u}>
                          {u}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                      <input
                        className="uk-input uk-margin-small uk-animation-slide-right"
                        name="selectedVal"
                        onChange={this.handleValueChange}
                        placeholder="Value"
                      />
                    )}
              </div>
            ) : null}

            {this.state.didSetValue ? (
              <div className="uk-width-1-3 uk-inline uk-animation-slide-right uk-margin-small">
                {this.state.editing ? (
                  <a
                    uk-tooltip="Save and lock this condition"
                    onClick={this.saveConditional}
                  ><Unlock /></a>
                ) : (
                    <a
                      href=""
                      className="uk-text-primary"
                      uk-tooltip="Edit this condition"
                      onClick={this.editConditional}
                    ><Lock /></a>
                  )}
                <a
                  href=""
                  className="uk-margin-small-left uk-text-danger"

                  uk-tooltip="Remove this condition"
                  onClick={this.deleteConditional}
                ><Trash /></a>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}
export default QueryCondition;

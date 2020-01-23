import React, { Component } from "react";
import * as UIkit from "uikit";
import { ReportItem } from "../classes/ReportSet";
import "../query-tree.css";
import QueryCondition from './QueryCondition';
import { Plus, Trash } from './Icons';

/**
 * The Query Builder main component. Any new Query Groups will have the delete
 *  option to delete the group and it's children.
 * @param {*} props IsFirst, QueryColumns, Operators, CountryList, LastUpdatedUser, OnCollect, OnRemoveGroup, OnAddCondition
 */
export class QueryGroup extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    console.log("QueryGroup Props: ", this.props);
    let group = this.props.Group;
    let children = group.children;
    // If this is the first rendered Group, create a conditional
    if (this.props.IsFirst) {
      children.push(
        <QueryCondition
          key={0}
          QueryColumns={this.props.QueryColumns}
          Operators={this.props.Operators}
          CountryList={this.props.CountryList}
          LastUpdatedUsers={this.props.LastUpdatedUsers}
          OnCapturedValue={this.OnCapturedValue}
          OnSaveCondition={this.conditionalSaved}
          OnRemove={this.OnRemove}
          Group={group}
        />
      );

      // Update children and group
      group.children = children;
    }

    return {
      // Create ReportGroup for visualizing the query and saving to DB
      group: group
    };
  };

  onGroupSaved = reportGroup => {
    // pass back to props to save
  };

  /**
   * Called when the child QueryConditional blurs from value input
   */
  conditionalSaved = reportItem => {
    let group = this.state.group;
    let items = group.reportItems;
    if (items.length < 1) items.push(reportItem);
    else {
      // Check if item exists, update is so
      let idx = items.indexOf(reportItem);
      if (idx > -1) {
        items[idx] = reportItem;
      } else {
        // Not found, add
        items.push(reportItem);
      }
    }

    group.reportItems = items;
    this.setState({ group: group });

    // trigger props to save from base view
    // we send back the whole group
    console.log(group, group.reportItems);
    this.props.OnConditionalSaved(group);
  };

  addCondition = e => {
    e.preventDefault();
    let group = this.state.group;
    let children = group.children;
    let len = children.length;

    children.push(
      <QueryCondition
        key={len + 1}
        QueryColumns={this.props.QueryColumns}
        Operators={this.props.Operators}
        CountryList={this.props.CountryList}
        LastUpdatedUsers={this.props.LastUpdatedUsers}
        OnCapturedValue={this.OnCapturedValue}
        OnSaveCondition={this.conditionalSaved}
        OnRemove={this.OnRemove}
        Group={group}
      />
    );

    UIkit.dropdown("#addDropdown").hide();
    group.children = children;

    // Update State but don't notify the parent report
    // we will update that when we have values
    this.setState({ group: group });
  };

  addGroup = e => {
    e.preventDefault();
    let group = this.state.group;
    let children = group.children;
    let len = children.length;

    children.push(
      <QueryGroup
        key={len + 1}
        QueryColumns={this.props.QueryColumns}
        Operators={this.props.Operators}
        CountryList={this.props.CountryList}
        LastUpdatedUsers={this.props.LastUpdatedUsers}
        IsFirst={false}
        GroupId={group.groupId}
      />
    );

    group.children = children;
    this.setState({ group: group });

    // Hide the add dropdown
    UIkit.dropdown("#addDropdown").hide();
  };

  handleConditionalTypeClick = type => {
    let group = this.state.group;
    group.condition = type;
    this.setState({ group: group });
  };

  OnCapturedValue = (e, value) => {
    console.log(e, value);
  };

  OnRemove = e => {
    console.log(e);
  };

  render() {
    return (
      <div className="uk-width-1-1">
        <ul className="query-tree">
          <li>
            <div className="uk-grid-small uk-flex-left">
              <div className="uk-button-group">
                <button
                  onClick={() => this.handleConditionalTypeClick("AND")}
                  className={
                    this.state.group.condition === "AND"
                      ? "uk-button uk-button-primary uk-button-small"
                      : "uk-button uk-button-small"
                  }
                >
                  AND
                </button>
                <button
                  onClick={() => this.handleConditionalTypeClick("OR")}
                  className={
                    this.state.group.condition === "OR"
                      ? "uk-button uk-button-primary uk-button-small"
                      : "uk-button uk-button-small"
                  }
                >
                  OR
                </button>
              </div>

              <div className="uk-button-group uk-margin-small-left">
                <div className="uk-inline">
                  <Plus uk-tooltip="Click to add" />
                  <div
                    uk-dropdown="mode: click; delay-hide: 0;"
                    id="addDropdown"
                  >
                    <p onClick={this.addGroup} className="uk-margin-small">
                      <Plus />
                      Add Group
                    </p>
                    <p onClick={this.addCondition} className="uk-margin-small">
                      <Plus />
                      Add Condition
                    </p>
                  </div>
                  {this.props.IsFirst ? null : (
                    <Trash
                      className="uk-margin-small uk-margin-left"
                      uk-tooltip="Remove this group"
                    />
                  )}
                </div>
              </div>
            </div>
          </li>
          {this.state.group.children.map(child => {
            return (
              <li className="uk-card uk-card-default uk-padding-small">
                {child}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default QueryGroup;

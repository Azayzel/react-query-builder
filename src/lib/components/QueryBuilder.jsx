import React from "react";
import Highlight from "react-highlight.js";
import * as UIkit from 'uikit';
import ReportSet, { ReportGroup } from "../classes/ReportSet";
import QueryGroup from "./QueryGroup";
import { Cog, Plus } from './Icons';
import "uikit/dist/css/uikit.min.css";


/**
 * ReactQueryBuilder Component
 * 
 * * If providing a previously saved report
 * @example <QueryBuilder user={this.props.User} ReportSet={this.state.reportSet} UpdateReport={this.onUpdateReport} />
 * 
 * * If not providing a report
 * @example <QueryBuilder user={this.props.User} UpdateReport={this.onUpdateReport}/>
 */
class QueryBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getInitialState();
        this.conditionRef = React.createRef();
        this.groupRef = React.createRef();
        /*
        this.onUpdateQuery = this.onUpdateQuery.bind(this);
        this.handleAddCondition = this.handleAddCondition.bind(this);
        this.handleFieldSelect = this.handleFieldSelect.bind(this);
        this.handleNewGroup = this.handleNewGroup.bind(this);
        this.handleResultLimit = this.handleResultLimit.bind(this);
        this.handleSortBy = this.handleSortBy.bind(this);
        this.handleSortDir = this.handleSortDir.bind(this);
        this.processReportData = this.processReportData.bind(this);
        this.resetReport = this.resetReport.bind(this);
        this.scrollToTable = this.scrollToTable.bind(this);
        */
    }

    componentDidMount() {
        // Attach the
        console.log(UIkit)
    }

    componentDidUpdate(prevprops, state) {
        if (prevprops.ReportSet !== this.props.ReportSet) {
            this.setState({ reportSet: this.props.ReportSet });
        }
    }

    onUpdateQuery = (str) => {
        this.setState({ query: str });
    };

    getInitialState = () => {
        let reportSet = this.props.ReportSet
            ? this.props.ReportSet
            : new ReportSet(this.props.user.fullName);
        return {
            queryGroup: [],
            setSortBy: false,
            reportSet: reportSet,
            isCreatingReport: this.props.ReportSet ? true : false,
            data: [],
            dataColumns: [],
            dataLoaded: false,
            excludeEIU: false
        };
    };

    //#region Query Options
    handleFieldSelect = (field) => {
        let set = this.state.reportSet;
        let report = set.report;
        let fields = report.returnFields;
        let idx = fields.indexOf(field);
        if (idx > -1) {
            fields.splice(idx, 1);
        } else {
            fields.push(field);
        }

        report.returnFields = fields;

        // Save updated report to set
        set.report = report;

        // Regenerate queryString
        set.generateQueryString();

        // Set state
        this.setState({ reportSet: set });
    };

    handleResultLimit = (e) => {
        let set = this.state.reportSet;
        let report = set.report;
        let limit = e.target.value;
        report.resultLimit = limit;

        // Save updated report to set
        set.report = report;

        // Regenerate queryString
        set.generateQueryString();

        // Set state
        this.setState({ reportSet: set });
    };

    handleSortBy = (e) => {
        let set = this.state.reportSet;
        let report = set.report;
        let field = e.target.value;
        report.sortBy = field;

        // Save updated report to set
        set.report = report;

        // Regenerate queryString
        set.generateQueryString();

        // Set state
        this.setState({ reportSet: set });
    };

    handleSortDir = (e) => {
        let set = this.state.reportSet;
        let report = set.report;
        let dir = e.target.value;
        report.sortDir = dir;

        // Save updated report to set
        set.report = report;

        // Regenerate queryString
        set.generateQueryString();

        // Set state
        this.setState({ reportSet: set });
    };
    //#endregion

    handleNewGroup = (group) => {
        console.log(group, this.state.reportSet.report.queryGroup);
    };

    onHandleUpdateGroup = (group) => {
        if (this.state.reportSet.report.queryGroup.groupId == group.groupId) {
            // New, First group
            let reportSet = this.state.reportSet;
            reportSet.report.queryGroup = group;

            // update state
            this.setState({ reportSet: reportSet });
        }
    };

    handleAddCondition = (e) => {
        console.log(e, this.state.reportSet.report.queryGroup);
    };

    /**
     * Hook called from children to update the report with new items
     * @param {ReportGroup} group The updated ReportGroup
     */
    updateReport = (group) => {
        // Update the Report's Query Group
        let set = this.state.reportSet;
        let report = set.report;
        report.queryGroup = group;

        // Update report on set
        set.report = report;

        // Re-Generate Query String
        set.generateQueryString();

        // Notify parent of update if this
        //  if for report creation
        if (this.state.isCreatingReport) this.props.UpdateReport(set);

        // Set state of component
        this.setState({ reportSet: set });
    };

    resetReport = (e) => {
        e.preventDefault();
        let report = new ReportSet(this.props.user.fullName);
        this.setState({ reportSet: report });
    };

    scrollToTable = () => {
        UIkit.scroll("#reportsTable").scrollTo("#resultsTable");
    };

    processReportData = (arr) => {
        let cols = [];

        // Get Keys from the firt object in the array to add to columns
        for (let key of Object.keys(arr[0])) {
            let colObj = {
                name: key,
                selector: key,
                sortable: true
            };
            cols.push(colObj);
        }
        this.setState({ dataColumns: cols, data: arr, dataLoaded: true }, () => {
            setTimeout(() => this.scrollToTable(), 200);
        });
    };

    executeQuery = (e) => {
        e.preventDefault();
        this.setState({ executing: true }, () => {
            Promise.resolve(UIkit.modal("#savingUpdate-modal").show());
            this.state.reportSet
                .executeQuery()
                .then(data => {
                    if (data.length > 0) {
                        Promise.resolve(UIkit.modal("#savingUpdate-modal").hide());
                        this.processReportData(data);
                    } else {
                        Promise.resolve(UIkit.modal("#savingUpdate-modal").hide());
                        Promise.resolve(UIkit.modal("#nodatafound-modal").show());
                    }
                })
                .catch(err => {
                    Promise.resolve(UIkit.modal("#savingUpdate-modal").hide());

                });
        });
    };


    render() {
        return (
            <div className="uk-container uk-container-expand">
                <div className="uk-width-1-1 uk-margin-bottom">
                    <legend className="uk-text-lead uk-legend">Build A Query</legend>
                    <Highlight language="sql" className="uk-width-1-1">
                        {this.state.reportSet.report.queryString}
                    </Highlight>
                </div>
                <div className="uk-width-1-1" id="reportsTable">
                    <div>
                        <p className="uk-text-meta">
                            Query Options{" "}
                            <i className="uk-margin-small-left"><Cog /></i>
                        </p>
                        <div uk-dropdown="mode: click; delay-hide: 0" id="queryOptions">
                            <div
                                className="uk-dropdown-grid uk-child-width-1-2@m"
                                uk-grid="true"
                            >
                                <div className="uk-form-stacked">
                                    <label className="uk-form-label">Return Columns</label>
                                    <label className="uk-form-label uk-text-meta">
                                        * Default is all
                  </label>
                                    <ul className="uk-list">
                                        {this.state.reportSet.report.columns.map((c, i) => {
                                            return (
                                                <li>
                                                    <label>
                                                        <input
                                                            className="uk-checkbox"
                                                            type="checkbox"
                                                            onChange={e => this.handleFieldSelect(c.name)}
                                                        />{" "}
                                                        {c.title}
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <div>
                                    <div className="uk-form-stacked">
                                        <div className="uk-margin-small">
                                            <label className="uk-form-label">Results Limit</label>
                                            <select
                                                className="uk-select"
                                                onChange={this.handleResultLimit}
                                            >
                                                <option value="All">All</option>
                                                <option value="10">10</option>
                                                <option value="25">25</option>
                                                <option value="75">75</option>
                                            </select>
                                        </div>

                                        <div className="uk-margin-small">
                                            <label className="uk-form-label">Sort By</label>
                                            <select
                                                className="uk-select"
                                                onChange={this.handleSortBy}
                                            >
                                                {this.state.reportSet.report.columns.map((c, i) => {
                                                    return <option value={c.name}>{c.title}</option>;
                                                })}
                                            </select>
                                        </div>

                                        <div className="uk-margin-small">
                                            <label className="uk-form-label">Sort Dir</label>
                                            <select
                                                className="uk-select"
                                                onChange={this.handleSortDir}
                                            >
                                                <option value="ASC">ASC</option>
                                                <option value="DESC">DESC</option>
                                            </select>
                                        </div>

                                        <div className="uk-margin-small">
                                            <button
                                                className="uk-button uk-button-primary"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    UIkit.dropdown("#queryOptions").hide();
                                                }}
                                            >
                                                Save
                      </button>
                                        </div><div className="uk-margin-small">
                                            <button
                                                className="uk-button uk-button-default"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    this.resetReport(e)
                                                    UIkit.dropdown("#queryOptions").hide();
                                                }}
                                            >
                                                Reset
                      </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <QueryGroup
                    QueryColumns={this.state.reportSet.report.columns}
                    Operators={this.state.reportSet.report.operators}
                    CountryList={this.props.countryList}
                    LastUpdatedUsers={this.props.lastUpdatedUsers}
                    IsFirst={true}
                    Group={this.state.reportSet.report.queryGroup}
                    OnConditionalSaved={this.updateReport}
                />
                <div className="uk-container uk-container-expand uk-margin-top uk-animation-slide-right">
                    <div className="uk-width-1-1">
                        <button
                            className="uk-button uk-button-primary"
                            onClick={this.executeQuery}
                        >Execute
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default QueryBuilder;
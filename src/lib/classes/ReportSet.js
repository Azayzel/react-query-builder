import { generateUUID } from "../Utilities";
import squel from "squel";
/**
 * Report Class to handle the creation of the new report
 *  along with the query set and query string o be generated
 *  by this class
 *
 * @param {auth_user} user Required
 */
export default class ReportSet {
  constructor(
    user,
    isQuery = false,
    reportName = null,
    form = null,
    conversion = null,
    multiplier = null,
    description = null,
    Query = []
  ) {
    this.report = {
      reportName: null,
      form: null,
      columns: null,
      operators: null,
      queryGroup: null,
      downloadOnComplete: true,
      isQuery: false,
      returnFields: [],
      resultLimit: "All",
      sortBy: "id",
      sortDir: "DESC",
      queryString: "SELECT * FROM _table_", // The initial query string
      user: null // ALWAYS track user to save query to DB.QueryCache
    };

    // If isQuery true; we know this was from QueryBuilder and
    //  not from the Report Wizard
    if (isQuery) {
      this.report.user = user;
      this.report.isQuery = isQuery;
      this.report.columns = getQueryColumns();
      this.report.operators = getQueryOperators();
      this.report.queryGroup = new ReportGroup("AND", []);

      return this;
    }
    // If a previously generated form is supplied, instantiate that report
    else if (form !== null) {
      this.report.user = user;
      this.report.isQuery = isQuery;
      this.report.form = this.fromForm(form);
      this.report.reportName = this.report.form.name;
      this.report.columns = getQueryColumns();
      this.report.operators = getQueryOperators();
      this.report.queryGroup = new ReportGroup("AND", []);

      return this;
    }

    // Else create a new report
    this.report.user = user;
    this.report.isQuery = isQuery;
    this.report.reportName = reportName;
    this.report.form = new ReportForm(
      reportName,
      user,
      conversion,
      multiplier,
      description,
      Query
    );
    this.report.columns = getQueryColumns();
    this.report.operators = getQueryOperators();
    this.report.queryGroup = new ReportGroup("AND", []);

    return this;
  }

  /**
   * Initialize an already created form for editing
   * @param {ReportForm} from
   */
  fromForm = form => {
    this.Form = form;

    // parse the query_set to a valid JS Array
    this.Form.query_set = JSON.parse(this.form.query_set);
  };

  /**
   * Updates the Report's queryGroup to keep track of changes. This will also re-generate the queryString if supplied
   */
  updateQueryGroup = (group, regenerateQueryString) => {
    this.report.queryGroup = group;

    if (regenerateQueryString) {
      //
    }
  };

  updateQuerySet = newQueryArr => {
    this.Form.query_set = newQueryArr;
  };

  downloadReportFromS3 = () => {
    // kick off download to the s3 file
    // this.Form.s3_url
  };

  /**
   * Generate the query string from current props
   * @param {boolean} excludeEIU true
   */
  generateQueryString = (excludeEIU = true) => {
    let _query = squel.select();
    if (this.report.returnFields.length > 0) {
      this.report.returnFields.map(f => {
        _query.field(f);
        return null;
      });
    }

    _query.from("_table_");

    // Get Groups and conditions and append with .where()
    let group = this.report.queryGroup;

    group.reportItems.forEach(item => {
      console.log(item);
      let qString;
      if (item.operator == "LIKE" || item.operator == "NOT LIKE") {
        // We append 2 % to the value for Postgres LIKE and to escape it and force python to leave it alone
        qString = `${item.column} ${item.operator} '${item.value}%%'`;
      } else {
        qString = `${item.column} ${item.operator} '${item.value}'`;
      }
      _query.where(qString);
    });

    // Default sort in squel is ASC, if selected DESC, set it
    let sortBy = this.report.sortBy;
    let sortDir = this.report.sortDir === "ASC" ? true : false;

    _query.order(sortBy, sortDir);

    // Set Limit if it was set to anything other than 'All'
    let limit = this.report.resultLimit;
    if (limit !== "All") {
      let numLimit = Number(limit);
      _query.limit(numLimit);
    }

    // Set String
    this.report.queryString = _query.toString();
  };

  /**
   * Save the report to the database, execute query, and return results
   * @returns Promise<Data>
   */
  saveReport = () => {
    let form = this.report.form;
    // Stringify query_set to save in DB
    form.query_string = this.report.queryString;

    this.props.UpdateReport(form);
  };

  /**
   * Send the SQL query to the server to be executed
   * @returns
   */
  executeQuery = () => {
    // Call to Query API from Utilities.js
    // executeDBQuery(queryStr, this.report.user)
    //              .then(res => return res.data)
    //              .catch(err => throw err)
    let form = this.report.form;
    // Stringify query_set to save in DB
    form.query_string = this.report.queryString;
    this.props.ExecuteReport(form.query_string);
  };
}

export class ReportItem {
  constructor(groupId, column, operator, value) {
    this.groupId = groupId;
    this.uuid = generateUUID();
    this.column = column;
    this.operator = operator;
    this.value = value;
    return this;
  }
}

/**
 * Base QueryGroup class to help track conditionals for each group
 * @param {string} condition 'AND' | 'OR'
 * @param {array} reportItems 'Array<ReportItem>' | '[]'
 * @param {string} groupId The UUID of the parent group to nest this group into
 */
export class ReportGroup {
  constructor(condition, reportItems, groupId = null) {
    // Unique UUID
    this.groupId = groupId == null ? generateUUID() : groupId;
    // 'AND' | 'OR'
    this.condition = condition;
    // Array<ReportItem>
    this.reportItems = reportItems;
    // Children components to render
    this.children = [];
  }

  /**
   * Add a ReportItem to this group.
   * @param {ReportItem} reportItem ReportItem
   * @returns {bool} True for 'OK' or False for 'Error'
   */
  addReportItem = reportItem => {
    // verify we're adding to the correct group
    if (this.groupId === reportItem.groupId) {
      if (this.reportItems.length > 0) {
        // Check if we have a conditional like this in our list
        for (let i = 0; i <= this.reportItems; i++) {
          let { column, operator, value } = this.reportItems[i];

          // We're checking equality against each prop to ensure no dupes
          //  return false to signal an error
          if (
            column === reportItem.column &&
            operator === reportItem.operator &&
            value === reportItem.value
          )
            return false;
        }
      }

      // Safe to add item
      this.reportItems.push(reportItem);
      return true;
    }

    // Send back error, this was not for the correct group
    return false;
  };

  /**
   * Update the supplied ReportItem
   * @param {ReportItem} reportItem ReportItem
   * @returns {bool} True for 'OK' or False for 'Error'
   */
  updateReportItem = reportItem => {
    let updated = false;
    this.reportItems.forEach(_item => {
      if (_item.uuid === reportItem.uuid) {
        _item = reportItem;
        updated = true;
      }
    });
    return updated;
  };

  /**
   * Remove a ReportItem by the supplied UUID
   * @param {string} uuid ReportItem.uuid
   * @returns {bool} True for 'OK' or False for 'Error'
   */
  removeReportItem = uuid => {
    let foundIndex = null;
    for (let i = 0; i <= this.reportItems.length; i++) {
      if (this.reportItems[i].uuid === uuid) foundIndex = i;
    }

    if (foundIndex) {
      this.reportItems.splice(foundIndex, 1);
      return true;
    }
    return false;
  };
}

export class ReportForm {
  constructor(
    reportName,
    user,
    conversion = null,
    multiplier = null,
    description = null,
    Query = []
  ) {
    return {
      created_by: user,
      is_public: true,
      name: reportName,
      long_name: null,
      description: description,
      conversion: conversion,
      multiplier: multiplier,
      s3_url: null,
      user_generated: true,
      last_generated: null,
      last_downloaded: null,
      query_set: Query,
      query_string: null
    };
  }
}

export const getQueryColumns = () => {
  return [
    { title: "Id", name: "id", type: "number" },
    { title: "Name", name: "name", tooltip: "e.g. `MPM1`", type: "string" },
    {
      title: "Long Name",
      name: "long_name",
      tooltip: "e.g. `Import market 1 (%share)`",
      type: "string"
    },
    { title: "Currency", name: "currency", tooltip: "", type: "string" },
    {
      title: "Method",
      name: "method",
      tooltip: "e.g. `IMF, Direction of Trade`",
      type: "string"
    },
    {
      title: "Category",
      name: "category_name",
      tooltip: "e.g. `Main origins of imports`",
      type: "string"
    },
    { title: "Value", name: "value", tooltip: "", type: "number" },
    { title: "Units", name: "units", tooltip: "", type: "string" },
    { title: "Year", name: "year", tooltip: "", type: "string" },
    { title: "Country", name: "country_id_id", tooltip: "", type: "string" },
    {
      title: "Indicator Status",
      name: "indicator_status",
      tooltip: "",
      type: "string"
    },
    {
      title: "Data Type",
      name: "item_type",
      tooltip: "e.g. `DES` or `EIU`",
      type: "string"
    }
  ];
};

export const buildQueryItemExpression = reportItem => { };

export const getQueryOperators = () => {
  return [
    { title: "Like", oper: "LIKE" },
    { title: "Not Like", oper: "NOT LIKE" },
    { title: "Equal", oper: "=" },
    { title: "Not Equal", oper: "!=" },
    { title: "Less Than", oper: "<" },
    { title: "Less Than or Equal To", oper: "<=" },
    { title: "Greater Than", oper: ">" },
    { title: "Greater Than or Equal to", oper: ">=" }
  ];
};

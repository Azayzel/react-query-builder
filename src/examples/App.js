import React, { Component } from "react";
import QueryBuilder from "react-query-builder-complete";

class App extends Component {
  constructor(props) {
    super(props)

  }

  /**
   * Do something on report update
   */
  onUpdateReport = (report) => {

  }

  render() {
    return (
      <div style={{ width: '80%', margin: "15px auto" }}>
        <h1>React Query Builder</h1>
        <QueryBuilder user={"Josh"} UpdateReport={this.onUpdateReport} />
      </div>
    )
  }
};

export default App;

# React Query Builder

This project is still very much a WIP as I am adapting it for OSS. Feel free to submit PRs and make it better!

## Demo

<iframe src="https://azayzel.github.io/react-query-builder-demo" frameborder="0" allowfullscreen="true"> </iframe>


## Installation

```js
npm install react-query-builder-complete
```

## Usage

 If providing a previously saved report

```js
  <QueryBuilder user={this.props.User} ReportSet={this.state.reportSet} UpdateReport={this.onUpdateReport} />
```

If not providing a report

```js
<QueryBuilder user={this.props.User} UpdateReport={this.onUpdateReport}/>
```

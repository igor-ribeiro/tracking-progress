import React, { Component } from 'react';
import 'whatwg-fetch';

import IssuesList from './components/issues/IssuesList';
import TasksTable from './components/tasks/tasks-table/TasksTable';

class App extends Component {
  state = {
    error: '',
    loading: false,
    data: {},
    fields: {
      username: 'igor.ribeiro',
      password: 'Ribeiro@Dafiti@448223',
    },
  }

  componentDidMount() {
    this.loadData({ preventDefault: _ => _ });
  }

  render() {
    const { fields, loading, data, error } = this.state;

    if (!data.issues || !data.issues.length) {
      return null;
    }

    return <TasksTable issues={data.issues}/>;

    return (
      <div>
        <h1>Tracking Progress</h1>
        <form onSubmit={this.loadData}>
          <input
            placeholder="username"
            value={fields.username}
            onChange={this.updateField}
            />
          <input
            placeholder="password"
            type="password"
            value={fields.password}
            onChange={this.updateField}
            />
          <button disabled={loading}>Load</button>
        </form>

        <div>{loading ? 'Loading...' : ''}</div>

        {this.renderIssues()}
      </div>
    );
  }

  renderIssues() {
    const { data } = this.state;

    if (!Object.keys(data).length) {
      return;
    }

    return <IssuesList issues={data.issues} />;
  }

  updateField = (event) => {
    const { name, value } = event.target;
    let { fields } = this.state;

    fields[name] = value;

    this.setState({ fields });
  }

  loadData = (event) => {
    event.preventDefault();

    const { username, password } = this.state.fields;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const body = JSON.stringify({
      username,
      password
    });

    const request = new Request('http://localhost:3333/tracking', {
      headers,
      body,
      method: 'POST',
    });

    this.setState({ loading: true });

    fetch(request)
      .then((response) => {
        if (!response.ok) {
          let error = '';

          if (response.statusCode === 401) {
            error = 'Login failed';
          }

          if (response.statusCode === 404) {
            error = 'Not found';
          }

          this.setState({ error, loading: false });

          return;
        }

        return response.json();
      })
      .then((data) => this.setState({ data, loading: false }));
  }
}

export default App;

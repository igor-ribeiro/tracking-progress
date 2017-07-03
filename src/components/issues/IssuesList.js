import React from 'react';

class IssuesList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { issues } = this.props;

    if (!issues.length) {
      return;
    }

    return (
      <div>
        <strong>Total: {issues.length}</strong>
        <ul>
          {issues.map(this.renderIssue)}
        </ul>
      </div>
    );
  }

  renderIssue = (issue) => {
    const sprint = this.getSprint(issue);

    return (
      <li key={issue.key}>
        <strong>{issue.key} - {issue.fields.summary}</strong>
        {sprint ? <div>{sprint}</div> : ''}
        <div>
          Status: {issue.fields.status.name}
          {' / '}
          Assignee: {issue.fields.assignee ? issue.fields.assignee.displayName : '-'} 
        </div>
        <br />
      </li>
    );
  }

  getSprint(issue) {
    const sprint = issue.fields.customfield_10800;
    const regex = new RegExp('name=([\\w\\s-]+),');

    if (!sprint) {
      return;
    }

    return regex.exec(sprint[0])[1];
  }
};

export default IssuesList;
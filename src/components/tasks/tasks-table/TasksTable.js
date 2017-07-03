import React from 'react';

import './TasksTable.css';

class TasksTable extends React.Component {
  state = {
    weeks: [],
    groupedIssues: [],
    weekdays: [ 'Seg', 'Ter', 'Qua', 'Qui', 'Sex' ],
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setup();
  }

  setup() {
    if (!this.props.issues || !this.props.issues.length) {
      return;
    }

    const groupedIssues = this.getIssuesFromPhaseGroupedBySprint(this.props.issues);
    const weeks = [];

    for (let index = 0; index < groupedIssues.length; index++) {
      const week = parseInt(index, 10);
      const nextWeek = week + groupedIssues.length;

      weeks[week] = week
      weeks[nextWeek] = nextWeek;
    };

    this.setState({ weeks, groupedIssues });
  }

  getIssuesFromPhaseGroupedBySprint(issues) {
    if (!issues || !issues.length) {
      return [];
    }

    const sprints = [];
    const grouped = [];

    issues
      .filter(({ fields }) => Array.isArray(fields.labels) && fields.labels.indexOf('TRK0') > -1)
      .forEach((issue) => {
        const sprint = this.getSprint(issue);

        if (!sprint) {
          return;
        }

        const sprintId = parseInt(sprint.id, 10);
        let sprintIndex = sprints.indexOf(sprintId);

        if (sprintIndex < 0) {
          sprints.push(sprintId);

          sprintIndex = sprints.indexOf(sprintId);
          
          grouped.push({ id: sprintId, name: sprint.name, issues: [] });
        }

        grouped[sprintIndex].issues.push(issue);
      });

    return grouped.sort((a, b) => a.id - b.id);
  }

  getSprint(issue) {
    const sprint = issue.fields.customfield_10800;
    const idRegex = new RegExp('id=([\\d]+),');
    const nameRegex = new RegExp('name=([\\w\\s-]+),');

    if (!sprint) {
      return;
    }

    return {
      id: idRegex.exec(sprint[0])[1],
      name: nameRegex.exec(sprint[0])[1],
    };
  }

  handleScroll = (event) => {
    this.leftPanel.scrollTop = event.target.scrollTop;

    const { scrollHeight, scrollWidth, scrollTop, clientHeight, clientWidth } = this.rightPanel;

    const scrollPercentage = scrollTop * 100 / (scrollHeight - clientHeight);
    const leftScroll = (scrollWidth - clientWidth) * (scrollPercentage / 100);

    console.log(leftScroll);

    this.rightPanel.scrollLeft = leftScroll;
    this.canvasHeader.scrollLeft = leftScroll;
  }

  render() {
    return (
      <div className="tasks-table">
        <main className="tasks-table-panels">
          <div className="tasks-table-panel is-fixed">
            <header className="tasks-table-panel-header">
              <div className="tasks-table-panel-header-project">
                <div className="tasks-table-panel-header-project-name">Tracking</div>
                <div className="tasks-table-panel-header-project-phase">Fase 0</div>
              </div>
            </header>

            <div className="tasks-table-panel-items" ref={(ref) => this.leftPanel = ref}>
              {this.state.groupedIssues.map((sprint) => (
                <div key={sprint.id}>
                  <div className="tasks-table-panel-row is-sprint">
                    <div className="tasks-table-panel-column">{sprint.name}</div>
                  </div>

                  {sprint.issues.map((issue) => (
                    <div key={issue.key} className="tasks-table-panel-row">
                      <div className="tasks-table-panel-column" title={issue.fields.summary}>
                        <a href={`https://dafiti.jira.com/browse/${issue.key}`} target="_blank">
                          {issue.key} - {issue.fields.summary}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="tasks-table-panel is-canvas">
            <header className="tasks-table-panel-header" ref={(ref) => this.canvasHeader = ref}>
              <div className="tasks-table-panel-header-weeks">
                {this.state.weeks.map((week) => (
                  <div key={`week-${week}`} className="tasks-table-panel-header-week">Semana {week + 1}</div>
                ))}
              </div>

              <div className="tasks-table-panel-header-weekdays-container">
                {this.state.weeks.map((week) => (
                  <div key={`week-${week}`} className="tasks-table-panel-header-weekdays">
                    {this.state.weekdays.map((weekday) => (
                      <div key={`weekday-${weekday}`} className="tasks-table-panel-header-weekday">{weekday}</div>
                    ))}
                  </div>
                ))}
              </div>
            </header>

            <div className="tasks-table-panel-items" onScroll={this.handleScroll} ref={(ref) => this.rightPanel = ref}>
              {this.state.groupedIssues.map((sprint, index) => {
                const startWeek = index * 2;

                return (
                  <div key={sprint.id}>
                    <div className="tasks-table-panel-row is-sprint">
                      {this.state.weeks.map((week) => (
                        <div key={`week-${week}`} className="tasks-table-panel-column-group">
                          {Object.keys(this.state.weekdays).map((day) => (
                            <div key={day} className="tasks-table-panel-column"></div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {sprint.issues.map((issue) => {
                      let points = issue.fields.customfield_10003 + 1;
                      let status = 'status-to-do';

                      const done = ['10062', '10061', '11030'];
                      const progress = ['3'];

                      if (progress.indexOf(issue.fields.status.id) > -1) {
                        status = 'status-done';
                      }

                      if (done.indexOf(issue.fields.status.id) > -1) {
                        status = 'status-done';
                      }

                      return (
                        <div key={issue.key} className={`tasks-table-panel-row ${status}`}>
                          {this.state.weeks.map((week) => (
                            <div key={`week-${week}`} className="tasks-table-panel-column-group">
                              {Object.keys(this.state.weekdays).map((day) => {
                                let isFilled = false;

                                if (week === startWeek && points > 0) {
                                  isFilled = true;
                                  points--;
                                }

                                return (
                                  <div key={day} className={`tasks-table-panel-column ${isFilled ? 'is-filled' : ''}`}></div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default TasksTable
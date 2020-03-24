import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Icon } from '@edx/paragon';
import LMSApiService from '../../data/services/LmsApiService';
import ReportingConfigForm from './ReportingConfigForm';
import { camelCaseObject, snakeCaseFormData } from '../../utils';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';

class ReportingConfig extends React.Component {
  state = {
    loading: true,
    reportingConfigs: [],
    error: undefined,
  };

  // eslint-disable-next-line react/sort-comp
  newConfigFormRef = React.createRef();

  componentDidMount() {
    LMSApiService.fetchReportingConfigs(this.props.enterpriseId)
      .then(response => this.setState({
        reportingConfigs: response.data.results,
        loading: false,
      }))
      .catch(error => this.setState({
        error,
        loading: false,
      }));
  }

  /**
   * Creates a new reporting configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createConfig = async (formData) => {
    //  snake_case the data before sending it to the backend
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LMSApiService.postNewReportingConfig(transformedData);
      this.setState(prevState => ({
        reportingConfigs: [
          ...prevState.reportingConfigs,
          response.data,
        ],
      }));
      this.newConfigFormRef.current.close();
      return undefined;
    } catch (error) {
      return error;
    }
  }

  deleteConfig = async (uuid) => {
    try {
      await LMSApiService.deleteReportingConfig(uuid);
      const deletedIndex = this.state.reportingConfigs
        .findIndex(config => config.uuid === uuid);
      const reportingConfigsCopy = this.state.reportingConfigs;
      reportingConfigsCopy.splice(deletedIndex, 1);
      this.setState({
        reportingConfigs: reportingConfigsCopy,
      });
      return undefined;
    } catch (error) {
      return error;
    }
  }

  /**
   * Updates an existing reporting configuration. Returns if there is an
   * error.
   * @param {FormData} formData
   * @param {string} uuid -> The uuid of the configuration we are updating
   */
  updateConfig = async (formData, uuid) => {
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LMSApiService.updateReportingConfig(transformedData, uuid);
      const updatedIndex = this.state.reportingConfigs
        .findIndex(config => config.uuid === response.data.uuid);
      const reportingConfigsCopy = [...this.state.reportingConfigs];
      reportingConfigsCopy[updatedIndex] = response.data;
      this.setState({ reportingConfigs: [...reportingConfigsCopy] });
      return undefined;
    } catch (error) {
      return error;
    }
  }

  render() {
    const { reportingConfigs, loading, error } = this.state;
    if (loading) {
      return <LoadingMessage className="overview" />;
    }
    if (error) {
      return (
        <ErrorPage
          status={error.response && error.response.status}
          message={error.message}
        />
      );
    }
    return (
      <main role="main">
        <div>
          <React.Fragment>
            {reportingConfigs &&
              reportingConfigs.map(config => (
                <div
                  key={config.uuid}
                  className="mb-3"
                >
                  <Collapsible
                    styling="card"
                    className="shadow"
                    title={
                      <div className="row justify-content-around flex-fill">
                        <Icon
                          className={`col-1 ${config.active ? ' fa fa-check text-success-300' : ' fa fa-times text-danger-300'}`}
                        />
                        <div className="col">
                          <h3 className="h6">Report Type:</h3>
                          <p>{config.data_type}</p>
                        </div>
                        <div className="col">
                          <h3 className="h6">Delivery Method:</h3>
                          <p>{config.delivery_method}</p>
                        </div>
                        <div className="col">
                          <h3 className="h6">Frequency:</h3>
                          <p>{config.frequency}</p>
                        </div>
                      </div>
                    }
                  >
                    <ReportingConfigForm
                      config={camelCaseObject(config)}
                      updateConfig={this.updateConfig}
                      createConfig={this.createConfig}
                      deleteConfig={this.deleteConfig}
                    />
                  </Collapsible>
                </div>
              ))
            }
            <Collapsible
              styling="basic"
              title="Add a reporting Configuration"
              className="col justify-content-center align-items-center"
              ref={this.newConfigFormRef}
            >
              <div>
                <ReportingConfigForm
                  createConfig={this.createConfig}
                />
              </div>
            </Collapsible>
          </React.Fragment>
        </div>
      </main>
    );
  }
}

ReportingConfig.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      hasRequestedCodes: PropTypes.bool,
    }),
  }).isRequired,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

export default ReportingConfig;
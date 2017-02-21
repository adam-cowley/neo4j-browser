import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { getActiveConnectionData, setActiveConnection, updateConnection, CONNECT } from 'shared/modules/connections/connectionsDuck'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import { FORCE_CHANGE_PASSWORD } from 'shared/modules/cypher/cypherDuck'
import { changeCurrentUsersPasswordQueryObj } from 'shared/modules/cypher/authProcedures'

import FrameTemplate from '../FrameTemplate'
import ConnectForm from './ConnectForm'
import ConnectedView from './ConnectedView'
import ChangePasswordForm from './ChangePasswordForm'
import FrameError from '../FrameError'

export class ConnectionFrame extends React.Component {
  constructor (props) {
    super(props)
    const connection = this.props.frame.connectionData
    this.state = {
      ...connection,
      isConnected: (!!props.activeConnection),
      passwordChangeNeeded: false,
      error: {}
    }
  }
  connect () {
    this.setState({ currentError: null })
    this.props.bus.self(
      CONNECT,
      this.state,
      (res) => {
        if (res.success) {
          this.saveAndStart()
        } else {
          if (res.error.code === 'Neo.ClientError.Security.CredentialsExpired') {
            this.setState({ passwordChangeNeeded: true })
          } else {
            this.setState({ error: res.error })
          }
        }
      }
    )
  }
  onUsernameChange (event) {
    const username = event.target.value
    this.setState({username, error: {}})
  }
  onPasswordChange (event) {
    const password = event.target.value
    this.setState({password, error: {}})
  }
  onHostChange (event) {
    const host = event.target.value
    this.setState({host, error: {}})
  }
  saveCredentials () {
    this.props.updateConnection({
      id: this.state.id,
      host: this.state.host,
      username: this.state.username,
      password: this.state.password
    })
  }
  onChangePasswordChange ({ newPassword1, newPassword2 }) {
    this.setState({error: {}})
  }
  onChangePassword ({ newPassword, error }) {
    if (error && error.code) {
      return this.setState({error: error})
    }
    this.setState({error: {}})
    this.props.bus.self(
      FORCE_CHANGE_PASSWORD,
      {
        host: this.state.host,
        username: this.state.username,
        password: this.state.password,
        ...changeCurrentUsersPasswordQueryObj(newPassword)
      },
      (response) => {
        if (response.success) {
          return this.setState({ password: newPassword }, () => {
            this.connect()
          })
        }
        this.setState({error: response.error})
      }
    )
  }
  saveAndStart () {
    this.saveCredentials()
    this.props.setActiveConnection(this.state.id)
    this.props.executeInitCmd()
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.activeConnection) {
      this.setState({ isConnected: true })
    }
  }
  render () {
    let view
    if (this.state.isConnected) {
      view = <ConnectedView
        host={this.props.activeConnection.host}
        username={this.props.activeConnection.username}
      />
    } else if (!this.state.isConnected && !this.state.passwordChangeNeeded) {
      view = (<ConnectForm
        onConnectClick={this.connect.bind(this)}
        onHostChange={this.onHostChange.bind(this)}
        onUsernameChange={this.onUsernameChange.bind(this)}
        onPasswordChange={this.onPasswordChange.bind(this)}
        host={this.state.host}
        username={this.state.username}
        password={this.state.password}
      />)
    } else if (!this.state.isConnected && this.state.passwordChangeNeeded) {
      view = (<ChangePasswordForm
        onChangePasswordClick={this.onChangePassword.bind(this)}
        onChange={this.onChangePasswordChange.bind(this)}
      />)
    }
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={view}
      >
        <FrameError code={this.state.error.code} message={this.state.error.message} />
      </FrameTemplate>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: getSettings(state),
    activeConnection: getActiveConnectionData(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateConnection: (connection) => {
      dispatch(updateConnection(connection))
    },
    setActiveConnection: (id) => dispatch(setActiveConnection(id)),
    dispatchInitCmd: (initCmd) => dispatch(executeSystemCommand(initCmd))
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const initCmd = stateProps.settings.initCmd || stateProps.settings.cmdchar + 'play start'
  return {
    ...stateProps,
    ...ownProps,
    ...dispatchProps,
    executeInitCmd: () => {
      dispatchProps.dispatchInitCmd(initCmd)
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps, mergeProps)(ConnectionFrame))

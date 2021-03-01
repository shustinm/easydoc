import React, { Component } from "react"

class CloneTextField extends Component{
    constructor(props) {
        super(props)
        this.state = { errorText: '', value: props.value }
      }
      onChange(event) {
        if (event.target.value.match(phoneRegex)) {
          this.setState({ errorText: '' })
        } else {
          this.setState({ errorText: 'Invalid format: ###-###-####' })
        }
      }
      render() {
        return (
          <TextField hintText="Phone"
            floatingLabelText="Phone"
            name="phone"
            errorText= {this.state.errorText}
            onChange={this.onChange.bind(this)}
          />
        )
      }
    }
    
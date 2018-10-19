import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';
import './LinkField.css';


class LinkField extends Component {

    constructor( props ) {
        super( props );
        this.state = { editing: false };
        this.urlInput = null;
        this.textInput = null;
        this.setUrlInput = this.setUrlInput.bind( this );
        this.setTextInput = this.setTextInput.bind( this );
    }

    focusInput() {
        this.textInput && this.textInput.focus();
    }

    setUrlInput( input ) {
        this.urlInput = input;
    }

    setTextInput( input ) {
        this.textInput = input;
    }

    render() {
        return (
            <div className={ this.state.editing? 'link-field link-field--editing' : 'link-field'}>
                {this.state.editing ?
                    <div>
                        <div className="link-field__input">
                            <input type="text"
                                   id={`${this.props.id}-text`}
                                   ref={this.setTextInput}
                                   value={this.props.text}
                                   onChange={(e)=>this.props.actions.textChange(e.target.value)}
                            />
                            <label for={`${this.props.id}-text`}>text:</label>
                        </div>
                        <div className="link-field__input">
                            <input type="text"
                                   id={`${this.props.id}-url`}
                                   ref={this.setUrlInput}
                                   value={this.props.url}
                                   onChange={(e)=>this.props.actions.urlChange(e.target.value)}
                            />
                            <label for={`${this.props.id}-url`}>url:</label>
                        </div>
                        <Button className="link-field__done-button" size="small" variant="raised" onClick={()=>this.setState({ editing: false})}>
                            done
                        </Button>
                    </div>
                    :
                    <div>
                        <a href={this.props.url} target="new_win">{this.props.text}</a>
                        <nobr>
                            <Button size="small" variant="raised" onClick={()=>this.setState({ editing: true}, this.focusInput)}>
                                edit
                            </Button>
                            <Button size="small" variant="raised" onClick={()=>this.props.actions.remove()}>
                                - remove
                            </Button>
                        </nobr>
                    </div>
                }
            </div>
        );
    };

}

export default LinkField;
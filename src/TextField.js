import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';
import './TextField.css';


class TextField extends Component {

    constructor( props ) {
        super( props );
        this.state = { editing: false };
        this.textInput = null;
        this.setInput = this.setInput.bind( this );
        this.editComplete = this.editComplete.bind( this );
        this.edit = this.edit.bind( this );
    }

    focusInput() {
        this.textInput && this.textInput.focus();
    }

    setInput( input ) {

        if ( input && this.props.multiline ) {
            input.setAttribute( 'style', 'height:' + (input.scrollHeight) + 'px;overflow-y:hidden;' );
            input.addEventListener(
                "input",
                function () {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                },
                false
            );
        }

        this.textInput = input;
    }

    edit() {
        if ( this.props.allowEdit ) {
            this.setState( { editing: true }, this.focusInput );
        }
    }

    editComplete() {
        this.setState( { editing: false } );
        if ( this.props.content.trim() == '' && this.props.actions.remove ) {
            this.props.actions.remove();
        }
    }

    render() {
        return (
            <div className={this.state.editing? "text-field text-field--editing" : "text-field" }>
                {this.state.editing ?
                    this.props.multiline ?
                        <textarea
                            ref={this.setInput}
                            value={this.props.content}
                            onChange={(e)=>this.props.actions.change(e.target.value)}
                            onBlur={this.editComplete}>
                        </textarea>
                        :
                        <input type="text"
                               ref={this.setInput}
                               value={this.props.content}
                               onChange={(e)=>this.props.actions.change(e.target.value)}
                               onKeyUp={(e)=>{ if(e.which == 10 || e.which == 13){ e.target.blur() }}}
                               onBlur={this.editComplete}
                        />
                    :
                    <div>
                        <div className={this.props.multiline?"text-field__display text-field__display--multiline" : "text-field__display"}
                             onClick={this.edit}>
                            {this.props.content}
                        </div>
                    </div>
                }
            </div>
        );
    };

}

export default TextField;
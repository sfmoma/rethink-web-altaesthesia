import React, { Component } from 'react';

import './PublishModal.css';


class PublishModal extends Component {

    constructor( props ) {

        super( props );

        this.modalElement = React.createRef();

        this.hide = this.hide.bind( this );
        this.show = this.show.bind( this );

        this.state = { url: null };

    }

    componentDidMount() {
    }

    render() {
        return (
            <div ref={this.modalElement} className="modal-container">
                <div className="close-button" onClick={this.hide}>
                    <i className="fa fa-times-thin"></i>
                </div>
                <div className="publish-dialog">
                    <p>Your exhibition is now "view-only"</p>
                    <p>You can share it using this link:</p>
                    <span className="publish-dialog__url">{this.state.url}</span>
                    <p className="small">To edit again, use this browser on this device and click "edit" in the footer.</p>
                    <p className="small">Only your browser can edit this exhibition, but others may copy, edit and re-publish their own
                        version.</p>
                </div>
            </div>
        );
    };

    show( url ) {
        this.setState( { url: url } );
        this.modalElement.current.classList.add( 'modal-container--visible' );
        this.props.actions.allowScroll(false);
    }

    hide() {
        this.modalElement.current.classList.remove( 'modal-container--visible' );
        this.props.actions.allowScroll(true);
    }

}

export default PublishModal;
import React, {Component} from 'react';
import Button from 'muicss/lib/react/button';
import Gallery from './Gallery';
import PublishModal from './PublishModal';
import './App.css';
import 'font-awesome/css/font-awesome.css'

class App extends Component {
    constructor ( props ) {
        super( props );
        this.defaultGalleryState = {
            name: 'Exhibition Name',
            newGroupId: 0,
            groups: [],
            config: {
                version: '1.0.0',
                metaTypes: {
                    texture: { type: "texture", data: "describe a texture" },
                    sound: { type: "sound", data: { url: "link url", text: "link text" } },
                    story: { type: "story", data: "tell a story" }
                },
                maxGroupSize: 4,
                group: {
                    descriptionPrompt: 'please enter some of your thoughts about these objects...'
                }
            }

        };
        this.objectUrl = 'backend/api/query_works.php';
        this.postUrl = 'backend/api/post.php';
        this.getUrl = 'backend/api/get.php';

        this.scrollElement = null;

        this.apiGetObjects = this.apiGetObjects.bind( this );
        this.publish = this.publish.bind( this );
        this.saveState = this.saveState.bind( this );
        this.loadState = this.loadState.bind( this );
        this.startFresh = this.startFresh.bind( this );
        this.copyAndEdit = this.copyAndEdit.bind( this );
        this.scrollToTop = this.scrollToTop.bind( this );
        this.canEdit = this.canEdit.bind( this );
        this.createResourceId = this.createResourceId.bind( this );
        this.clearLocationHash = this.clearLocationHash.bind( this );
        this.setLocationHash = this.setLocationHash.bind( this );
        this.allowScroll = this.allowScroll.bind( this );

        this.gallery = React.createRef();
        this.publishModal = React.createRef();

        //always enter to gallery view
        this.clearLocationHash();

        //if there is no resourceId, make one and enter edit mode
        let resourceId = this.getUrlVars()[ 'resourceId' ];
        let allowEdit = false;
        if (!resourceId) {
            resourceId = this.createResourceId();
            this.updateURL( resourceId );
            allowEdit = true;
        }

        this.state = {
            resourceId: resourceId,
            allowEdit: allowEdit,
            savedMessageVisible: false,
            canEdit: this.canEdit( resourceId ),
            scrollTop: this.getScrollTop()
        };

    }


    componentDidMount () {
        this.loadState( this.state.resourceId );
    }

    render () {
        return (
            <div className={this.state.allowEdit? 'app app--editing': 'app app--viewing'}>

                <Gallery
                    allowEdit={this.state.allowEdit}
                    ref={this.gallery}
                    actions={this.galleryActions()}
                    data={this.defaultGalleryState}/>

                <div className="admin-bar">
                    {this.state.savedMessageVisible ?
                        <div className="admin-bar__message">
                            saved!
                        </div>
                        :
                        <div className="admin-bar__tools">
                            remember to
                            <Button size="small" onClick={this.saveState}>save</Button>
                            and
                            <Button size="small" onClick={this.publish}>publish</Button>
                            when you are done.
                        </div>
                    }
                </div>
                <div className="app__footer">
                    {this.state.canEdit ?
                        <span>
                            This looks like your exhibition...
                            <Button size="small" onClick={()=>this.edit()}>edit</Button>
                        </span>
                        :
                        <span>
                            Like this exhibition?
                            <Button size="small" onClick={()=>this.copyAndEdit()}>edit a copy</Button> or
                            <Button size="small" onClick={()=>this.startFresh()}>start fresh</Button>
                        </span>
                    }
                    <div className="project-link">Part of the <a href='https://openspace.sfmoma.org/series/rethink-web/'>Rethink: Web</a> series.</div>
                </div>

                <PublishModal ref={this.publishModal} actions={this.publishModalActions()}/>

            </div>
        );
    }

    publishModalActions () {
        return { allowScroll: this.allowScroll };
    }

    canEdit ( resourceId ) {
        if (typeof(Storage) !== "undefined") {
            let localResourceIds = localStorage.getItem( "altaesthesia_resource_ids" );
            if (localResourceIds && localResourceIds.indexOf( resourceId ) >= 0) {
                return true;
            }
        }
        return false;
    }

    createResourceId () {
        let resourceId = (new Date()).getTime();
        //add resourceId to localstorage to allow editing
        if (typeof(Storage) !== "undefined") {
            let resourceIds = localStorage.getItem( "altaesthesia_resource_ids" );
            if (!resourceIds || resourceIds.constructor !== Array) {
                resourceIds = [];
            }
            resourceIds.push( resourceId );
            localStorage.setItem( "altaesthesia_resource_ids", resourceIds );
        }
        return resourceId;
    }

    copyAndEdit () {
        let resourceId = this.createResourceId();
        this.updateURL( resourceId );
        this.setState( { canEdit: true, resourceId: resourceId }, ()=> {
            this.saveState();
            this.edit();
        } );
    }

    startFresh () {
        let resourceId = this.createResourceId();
        this.updateURL( resourceId );
        let freshState = JSON.parse( JSON.stringify( this.defaultGalleryState ) );
        this.setState( { canEdit: true, resourceId: resourceId }, ()=> {
            this.gallery.current.setState( freshState, ()=> {
                this.saveState();
                this.edit();
            } );
        } );
    }

    edit () {
        this.setState( { allowEdit: true } );
        this.scrollToTop();
    }

    scrollToTop () {
        document.getElementsByTagName( 'html' )[ 0 ].scrollTop = 0;
    }

    updateURL ( resourceId ) {
        if (global.history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?resourceId=' + resourceId;
            window.history.pushState( { path: newurl }, '', newurl );
        }
    }

    clearLocationHash () {
        window.location.hash = '';
    }

    setLocationHash ( newHash ) {
        window.location.hash = newHash;
    }

    getUrlVars () {
        var vars = {};
        var parts = window.location.href.replace( /[?&]+([^=&]+)=([^&#]*)/gi, function ( m, key, value ) {
            vars[ key ] = value;
        } );
        return vars;
    }

    galleryActions () {
        return {
            loadObjects: this.apiGetObjects,
            setHash: this.setLocationHash,
            clearHash: this.clearLocationHash,
            allowScroll: this.allowScroll
        };
    }

    postData ( url, data ) {
        var formData = new FormData();
        for (let key in data) {
            formData.append( key, data[ key ] );
        }

        // Default options are marked with *
        return fetch( url, {
            body: formData,
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //credentials: 'same-origin', // include, same-origin, *omit
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            //mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        } ).then( response=>response.json() );

    }

    publish () {
        this.clearLocationHash();
        this.saveState()
            .then( ( result )=> {
                this.setState( { allowEdit: false } );
                this.publishModal.current.show( window.location.href );
            } );
    }

    saveState () {
        let savedState = this.gallery.current.state;
        return this.postData( this.postUrl, { resourceId: this.state.resourceId, data: JSON.stringify( savedState ) } )
            .then( ( result )=> {
                this.setState( { savedMessageVisible: true } );
                setTimeout( ()=> {
                    this.setState( { savedMessageVisible: false } );
                }, 1500 )
                return result;
            } );
    }

    loadState ( resourceId ) {
        this.getData( this.getUrl + '?resourceId=' + resourceId )
            .then( data => {
                if (!data.error) {
                    data.config = this.defaultGalleryState.config;
                    this.gallery.current.setState( data );
                }
            } );
    }

    getData ( url ) {
        console.log( 'get data', url );
        // Default options are marked with *
        return fetch( url, {
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Accept": "application/json"
            },
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            //mode: 'cors', // no-cors, cors, *same-origin
            //redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        } ).then( response=>response.json() );

    }

    apiGetObjects ( query, page, pageSize ) {
        return this.getData( this.objectUrl + `?keywords=${query}&page=${page}+&page_size=${pageSize}` )
            .then( ( data )=> {
                if (data !== null) {
                    return data.results;
                } else {
                    //if request fails, try agian in 1000ms
                    setTimeout( ()=> {
                        this.apiGetObjects( query, page, pageSize )
                            .then( ( objects )=> {
                                return objects;
                            } );
                    }, 1000 );
                }
            } )
            .catch( ( e )=> {
                console.log( e );
            } );
    }

    allowScroll ( allow ) {
        if (allow) {
            document.getElementsByTagName( 'html' )[ 0 ].classList.remove( 'noscroll' );
            setTimeout( ()=> {
                this.restoreScrollTop();
            }, 0 );
        } else {
            this.saveScrollTop( ()=> {
                document.getElementsByTagName( 'html' )[ 0 ].classList.add( 'noscroll' );
            } );
        }
    }

    getScrollTop () {
        return this.getScrollingElement().scrollTop;
    }

    setScrollTop ( top ) {
        this.getScrollingElement().scrollTop = top;
    }

    saveScrollTop ( callback ) {
        this.setState( { scrollTop: this.getScrollTop() }, callback );
    }

    restoreScrollTop () {
        this.setScrollTop( this.state.scrollTop );
    }

    getScrollingElement () {
        var html = document.getElementsByTagName( 'html' )[ 0 ];
        var body = document.getElementsByTagName( 'body' )[ 0 ];
        if (this.scrollElement) {
            return this.scrollElement;
        } else {
            if (html.scrollTop !== body.scrollTop) {
                this.scrollElement = html.scrollTop > body.scrollTop ? html : body;
                return this.scrollElement;
            }
        }
        return html;
    }

}

export default App;
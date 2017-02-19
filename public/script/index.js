var Comment = React.createClass({
    rawMarkup: function() {
        var md = new Remarkable();
        var rawMarkup = md.render(this.props.children.toString());
            return { __html: rawMarkup };
        },
        
        render: function() {
            return (
                <div className="wish">
                    <div className="content">
                        <div className="text" dangerouslySetInnerHTML={this.rawMarkup()} >
                        </div>
                    </div>
                    <div className="author">
                        <span className="text">{this.props.author}</span>
                        <span className="time">{this.props.create_time}</span>
                    </div>
                </div> 
            );
        }
});

var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                    this.setState({data: data});
                 }.bind(this),
            error: function(xhr, status, err) {
                     console.error(this.props.url, status, err.toString());
                 }.bind(this)
        });
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
       
        $.ajax({
              url: this.props.url,
              dataType: 'json',
              type: 'POST',
              data: comment,
              success: function(data) {
                  this.setState({data: data});
              }.bind(this),
              error: function(xhr, status, err) {
                  this.setState({data: comments});
                  console.error(this.props.url, status, err.toString());
              }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    showWishBox: function() {
        $("#wish-field").show();
    },
    render: function() {
        return (
        <div className="container">
            <div className="header">
                <div className="title">
                    欢迎来到许愿墙...
                </div>
                <a className="add-wish" href="#" onClick={this.showWishBox}>发愿望</a>
            </div>
            <div className="main">
               <CommentList data={this.state.data} />
               <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
            <div className="footer">
                <div className="copyright">
                    许愿墙 2017.
                </div>
            </div>
        </div>
               );
    }
});

var CommentList = React.createClass({
    render: function() {  
        var commentNodes = this.props.data.map(function(comment) {  
        var create_time = new Date(comment.create_time);
        var y = create_time.getFullYear();
        var m = create_time.getMonth() + 1;
        var d = create_time.getDate();
        create_time = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + create_time.toTimeString().substr(0, 8);
        return (  
                <Comment author={comment.author} create_time={create_time} key={comment.id}>  
                {comment.text}  
                </Comment>  
            );  
        }); 
        return (  
                <div className="commentList">  
                {commentNodes}  
                </div>  
        );  
    }  
});  

var CommentForm = React.createClass({  
    getInitialState: function() {  
        return {author: '', text: ''};  
    },  
    handleAuthorChange: function(e) {  
        this.setState({author: e.target.value});  
    },  
    handleTextChange: function(e) {  
        this.setState({text: e.target.value});  
    },
    handleClose: function(e) {  
        $("#wish-field").hide();
    },  
    handleSubmit: function(e) {  
        e.preventDefault();  
        var author = this.state.author.trim();  
        var text = this.state.text.trim();  
        if (!author) {  
            alert("请输入昵称");
            $("#author").focus();
            return;  
        }  
        if (!text) {  
            alert("请输入信息");
            $("#text").focus();
            return;  
        }
        this.props.onCommentSubmit({author: author, text: text});  
        this.setState({author: '', text: ''});  
        $("#author").val("");
        $("#text").val("");
        $("#wish-field").hide();
    },  
    render: function() {  
        return ( 
        <form className="commentForm" onSubmit={this.handleSubmit}>  
        <div id="wish-field" className="wish-field">
            <div className="title">
                发愿望
                <img src="images/close.png" title="关闭窗口" onClick={this.handleClose}/>
            </div>
            <div>
                <label for="author">昵称(最多10个字)：</label>
                <input id="author" value={this.state.author} onChange={this.handleAuthorChange} placeholder="昵称" maxlength="10" name="author" type="text" />
            </div>
            <div>
                <label for="content">愿望（最多200个字）：</label>
                <textarea id="text" placeholder="愿望" maxlength="200" onChange={this.handleTextChange} name="text">{this.state.text}</textarea>
            </div>
            <div>
                <input type="submit" value="发布"/>
            </div>
        </div>
        </form>  
           );  
       }  
});  

ReactDOM.render(  
    <CommentBox url="/api/comments" pollInterval={3000} />,  
    document.getElementById('contentContainer')  
);  

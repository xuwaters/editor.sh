/// Generate the HTML source to show a GraphiQL interface
pub fn graphiql_source(graphql_endpoint_url: &str) -> String {
    let stylesheet_source = r#"
    <style>
      html, body {
        height: 100%;
        margin: 0;
        overflow: hidden;
        width: 100%;
      }
      #app {
        height: calc(100vh - 40px);
      }
      .jwt-token {
        background: linear-gradient(#f7f7f7, #e2e2e2);
        border-bottom: 1px solid #d0d0d0;
        font-family: system, -apple-system, 'San Francisco', '.SFNSDisplay-Regular', 'Segoe UI', Segoe, 'Segoe WP', 'Helvetica Neue', helvetica, 'Lucida Grande', arial, sans-serif;
        padding: 7px 14px 6px;
        font-size: 14px;
      }
      .jwt-token input {
          display: inline-block;
          width: 80%;
          padding: 5px;
          border: 0px;
          margin-left: 5px;
          font-size: 12px;
          color: #777777;
          border-radius: 3px;
      }
      .jwt-token button#remove-token{
          background: linear-gradient(#f9f9f9,#ececec);
          border-radius: 3px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.2), 0 1px 0 rgba(255,255,255,.7), inset 0 1px #fff;
          color: #555;
          border: 0px;
          margin: 0 5px;
          padding: 3px 11px 5px;
      }
    </style>
    "#;
    let fetcher_source = r#"
    <script>
      var token_element = document.getElementById('jwt-token');
      var remove_token = document.getElementById('remove-token');
      remove_token.onclick = function(){
        localStorage.removeItem('graphiql:jwtToken');
        token_element.value = '';
      }
      //
      token_element.value = localStorage.getItem('graphiql:jwtToken') || '';
      function graphQLFetcher(params) {
        const jwtToken = token_element.value;
        let headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        if (jwtToken) {
          localStorage.setItem('graphiql:jwtToken', jwtToken);
          headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': jwtToken ? `Bearer ${jwtToken}` : null
          };
        }
        return fetch(GRAPHQL_URL, {
            method: 'post',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(params)
        }).then(function (response) {
            return response.text();
        }).then(function (body) {
            try {
                return JSON.parse(body);
            } catch (error) {
                return body;
            }
        });
      }
      ReactDOM.render(
        React.createElement(GraphiQL, {
            fetcher: graphQLFetcher,
        }),
        document.querySelector('#app')
      );
    </script>
    "#;

    format!(r#"
<!DOCTYPE html>
<html>
<head>
    <title>GraphQL</title>
    {stylesheet_source}
    <link rel="stylesheet" type="text/css" href="//cdnjs.cloudflare.com/ajax/libs/graphiql/0.10.2/graphiql.css">
</head>
<body>
    <div class="jwt-token">
      <label>Token</label>
      <input id="jwt-token" placeholder="Paste token (without Bearer)">
      <button id="remove-token">✖</button>
    </div>
    <div id="app"></div>
    <script src="//cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/graphiql/0.11.11/graphiql.min.js"></script>
    <script>var GRAPHQL_URL = '{graphql_url}';</script>
    {fetcher_source}
</body>
</html>
"#,
        graphql_url = graphql_endpoint_url,
        stylesheet_source = stylesheet_source,
        fetcher_source = fetcher_source)
}

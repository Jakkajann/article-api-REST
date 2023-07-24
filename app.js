const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const articleSchema = {
  title: {
    type: String,
    required: [true, "Title Required"],
  },
  content: {
    type: String,
    required: [true, "Content Required"],
  },
};

const Article = mongoose.model("Article", articleSchema);

mongoose
  .connect("mongodb://127.0.0.1:27017/wikiDb", { useNewUrlParser: true })
  .then(() => {
    console.log("Sucessfully connected to the database");
  })
  .catch((err) => {
    console.log("Failed to connect to the database\n" + err);
  });

const article1 = new Article({
  title: "Article 1",
  content: "Content of article 1",
});

const article2 = new Article({
  title: "Article 2",
  content: "Content of article 2",
});

app.route("/articles")
  .get((req, res) => {
    Article.find({})
      .then((articles) => {
        if (articles.length === 0) {
          Article.insertMany([article1, article2]).then(
            res.redirect("/articles")
          );
        } else {
          res.send(articles);
        }
      })
      .catch((err) => {
        res.send(err);
      });
  })

  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    })

    newArticle
      .save()
      .then(() => {
        res.send("Sucessfully added a new article");
      })
      .catch((err) => res.send(err));
  })

  .delete((req, res) => {
    Article.deleteMany({})
      .then(() => {
        res.send("Deleted Sucessfully");
      })
      .catch((err) => res.send(err));
  });

app.route("/articles/:articleTitle")
  .get((req, res) => {
    articleTitle = req.params.articleTitle.replaceAll("-"," ");
    Article.findOne({title: articleTitle})
        .then( (foundArticle) => {
            if(foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("Article not found");
            }
        })
  })

  .put((req, res) => {
    articleTitle = req.params.articleTitle.replaceAll("-"," ");
    Article.replaceOne({title: articleTitle}, {title: req.body.title, content: req.body.content})
        .then(() => {
           res.send("Sucessfully updated");
        })
  })

  .patch((req, res) => {
    articleTitle = req.params.articleTitle.replaceAll("-"," ");
    Article.updateOne({title: articleTitle}, {title: req.body.title, content: req.body.content})
    .then((foundArticle) => {
        if(foundArticle){
            res.send("Sucessfully updated");
        } else {
            res.send("Article not found");
        }
       
    })
  })

  .delete((req, res) => {
    articleTitle = req.params.articleTitle.replaceAll("-"," ");
    Article.deleteOne({title: articleTitle})
        .then((foundArticle) => {
            if(foundArticle) {
                res.send("Deleted Sucessfully");
            } else {
                res.send("Article not found");
            }
        });
  });



app.listen(3000, () => {
  console.log("Server has started on port 3000");
});

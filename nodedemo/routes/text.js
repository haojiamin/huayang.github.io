var express = require('express');
var mysql = require('mysql');
var router = express.Router();
//图片上传
var fs = require('fs');
var formidable = require('formidable');

var pool = mysql.createPool({
		host: '127.0.0.1',
		user: 'root',
		password: 'hjm961010', //mysql安装时设置的pwd
		database: 'hjm', //数据库名称
		port: 3306 //端口号
	})
	//---------------------------------注册----------------------------------------
	//根据用户名获取信息
function getUserByName(uname, callback) {
	pool.getConnection(function(err, connection) {
		var getUserByUserName_Sql = 'SELECT * FROM user WHERE uname = ?';
		connection.query(getUserByUserName_Sql, [uname], function(err, result) {
			if(err) {
				console.log("getUserByName Error:" + err.message);
				return;
			}
			//connection.release()
			console.log("invoked[getUserByName]");
			callback(err, result);
		});
	})
}

function save(uname, pwd, tel, qq, callback) {
	pool.getConnection(function(err, connection) {
		var insertUser_Sql = 'insert into user (id,uname,pwd,tel,qq) values (0,?,?,?,?)';
		connection.query(insertUser_Sql, [uname, pwd, tel, qq], function(err, result) {
			if(err) {
				console.log("insertUser_Sql Error:" + err.message)
				return;
			}
			//connection.release()
			console.log("invoked[getUserByName]")
			callback(err, result);
		});
	})
}
//------------------------注册--------------------
router.post('/zhuce', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		console.log('into post zhuce..');
		var uname = req.body['uname'];
		var pwd = req.body['pwd'];
		var tel = req.body['tel'];
		var qq = req.body['qq'];
		console.log('>>>>' + uname + pwd + tel);

		getUserByName(uname, function(err, results) {
			if(results != null && results != '') {
				res.send({
					flag: 2
				});
				return;
			}
			save(uname, pwd, tel, qq, function(err, result) {
				if(err) {
					res.send({
						flag: 3
					});
					return;
				}
				if(result.insertId > 0) {
					console.log('注册成功');
					result = {
						flag: 1
					};
					res.send(result);
				} else {
					res.send({
						flag: 3
					});
					return;
				}
			})
		})
	})
	//------------------------------------登陆----------------------------------
router.post('/login', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	var uname = req.body['uname'];
	var pwd = req.body['pwd'];
	console.log('>>>' + uname + pwd);
	getUserByName(uname, function(err, results) {
		if(results == null || results == '') {
			res.send({
				flag: 2 //用户名不存在
			});
			return;
		} else if(results[0].uname !== uname || results[0].pwd !== pwd) {
			res.send({
				flag: 3 //登录失败
			});
			return;
		} else if(results[0].uname == uname && results[0].pwd == pwd) {
			res.send({
				flag: 1 //登录成功				
			});
			return;
		}
	});
});
//--------------------------获取信息列表  user列表展示-------------------------
function getAllUser(callback) {
	pool.getConnection(function(err, connection) {
		var getAllUsers_Sql = 'select * from user';
		connection.query(getAllUsers_Sql, function(err, result) {
			if(err) {
				console.log('getAllUsers Error:' + err.message);
				return;
			}
			callback(err, result);
		});
	});
}

router.get('/user', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	getAllUser(function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			// console.log('>>>'+results);
			res.send(results);
		}
	})
});

//--------------------------获取信息列表   new列表展示-------------------------
function getAllLists(callback) {
	pool.getConnection(function(err, connection) {
		var getAllUsers_Sql = 'select * from mynew';
		connection.query(getAllUsers_Sql, function(err, result) {
			if(err) {
				console.log('getAllLists Error:' + err.message);
				return;
			}
			callback(err, result);
		});
	});
}

//router.get('/list',function(req,res){
//	res.redirect('/table.html');//重定向
//});

router.get('/list', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	getAllLists(function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			// console.log('>>>'+results);
			res.send(results);
		}
	})
});

//----------------------------详情  通过Id获取详情-------------------
router.get('/detail', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	//get方式获取参数
	var id = req.param('id');
	console.log(id);
	//if(req.session.uname){
	getUserById(id, function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			res.send(results);
		}
	})
});

function getUserById(id, callback) {
	pool.getConnection(function(err, connection) {
		var getUserById_Sql = 'select * from mynew where id=?';
		connection.query(getUserById_Sql, [id], function(err, result) {
			if(err) {
				console.log("getUserById Error: " + err.message);
				return;
			}
			//connection.release();
			console.log("invoked[getUserById]");
			callback(err, result);
		});
	});
}

//-------------------------------------更新------------------
function updateNews(title, pic_src, content,content2,content3, redate, id, callback) {
	pool.getConnection(function(err, connection) {
		var update_Sql = "update mynew set title=?,pic_src=?,content=?,content2=?,content3=?,redate=? where id = ?";
		connection.query(update_Sql, [title, pic_src, content,content2,content3, redate, id], function(err, result) {
			if(err) {
				console.log("update_Sql Error: " + err.message);
				return;
			}
			// connection.release();
			console.log("invoked[updateNews]");
			callback(err, result);
		});
	});
};

router.post('/upEdit', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	console.log('into upda...');
	var id = req.body['id'];
	var title = req.body['title'];
	var content = req.body['content'];
	var content2 = req.body['content2'];
	var content3 = req.body['content3'];
	var redate = req.body['redate'];
	var imgSrc = req.body['imgSrc'];
	console.log("....." + title + "....." + redate + imgSrc);
	updateNews(title, imgSrc, content,content2,content3, redate, id, function(err, result) {
		if(err) {
			err = {
				flag: 3
			}; //更新失败
			res.send(err);
			return;
		}
		if(result.changedRows > 0) {
			console.log('更新成功');
			result = {
				flag: 1
			}; //更新成功
			res.send(result);
		} else {
			err = {
				flag: 2
			}; //更新失败
		}
	});
});

//------------------------new search搜索----------------------
router.get('/search', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	var s = req.param('s');
	console.log('>>>' + s);
	searchByTitle(s, function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			res.send(results);
		}
	})
});

function searchByTitle(s, callback) {
	pool.getConnection(function(err, connection) {
		var getUserById_Sql = "select * from  mynew  where title like '%' ? '%' ";
		connection.query(getUserById_Sql, [s], function(err, result) {
			if(err) {
				console.log("getUserById Error: " + err.message);
				return;
			}
			connection.release(); //释放数据库连接
			callback(err, result);
		});
	});
};
//------------------------user search搜索----------------------
router.get('/uSearch', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	var u = req.param('u');
	console.log('>>>' + u);
	searchByUname(u, function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			res.send(results);
		}
	})
});

function searchByUname(u, callback) {
	pool.getConnection(function(err, connection) {
		var getUserById_Sql = "select * from  user  where uname like '%' ? '%' ";
		connection.query(getUserById_Sql, [u], function(err, result) {
			if(err) {
				console.log("getUserById Error: " + err.message);
				return;
			}
			connection.release(); //释放数据库连接
			callback(err, result);
		});
	});
};
//--------------------------数据删除-------------------------
router.get('/del', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	var id = req.param('id');
	deleteById(id, function(err, results) {
		if(err) {
			err = {
				flag: 2
			}; //删除失败
			res.send(err);
		} else if(results.affectedRows > 0) {
			results = {
				flag: 1
			}; //删除成功
			res.send(results);
		}
	})
});
// 根据id删除用户
function deleteById(id, callback) {
	pool.getConnection(function(err, connection) {
		var deleteById_Sql = "delete from mynew where id = ?";
		connection.query(deleteById_Sql, [id], function(err, result) {
			if(err) {
				console.log("deleteById Error: " + err.message);
				return;
			}
			connection.release();
			console.log("invoked[deleteById]");
			callback(err, result);
		});
	});
};

//------------------------保存数据-----------------------------
function addsave(title, content, content2, content3, redate, pic_src, callback) {
	pool.getConnection(function(err, connection) {
		var insertUser_Sql = "insert into mynew(id,title,content,content2,content3,redate,pic_src) values(0,?,?,?,?,?,?)";
		connection.query(insertUser_Sql, [title, content, content, content2, redate, pic_src], function(err, result) {
			if(err) {
				console.log("addsave Error: " + err.message);
				return;
			}
			// connection.release();
			console.log("invoked[addsave]");
			callback(err, result);
		});
	});
};

//添加信息
router.post('/append', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	var title = req.body['title'];
	var content = req.body['content'];
	var content2 = req.body['content2'];
	var content3 = req.body['content3'];
	var redate = req.body['redate'];
	var imgSrc = req.body['imgSrc'];
	console.log("....." + title + "....." + redate + imgSrc);
	addsave(title, content, content2, content3, redate, imgSrc, function(err, result) {
		if(err) {
			err = {
				flag: 4
			}; //添加失败
			res.send(err);
			return;
		}
		if(result.insertId > 0) {
			console.log('添加成功！');
			result = {
				flag: 1
			}; //添加成功
			res.send(result);
		} else {
			err = {
				flag: 2
			}; //添加失败
		}
	})
});
//上传图片
router.post('/pic', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	console.log('meiyouma');
	var form = new formidable.IncomingForm();
	form.uploadDir = './public/load/';
	form.parse(req, function(error, fields, files) {
		for(var i in files) {
			var file = files[i];
			var fName = (new Date()).getTime();
			switch(file.type) {
				case "image/jpeg":
					fName = fName + ".jpg";
					break;
				case "image/png":
					fName = fName + ".png";
					break;

			}
			var newPath = "./public/load/" + fName;
			fs.renameSync(file.path, newPath);
			res.send(fName);
		}

	})

})

//分页
//总条数
function getPages(pageNum, callback) {
	console.log('into getPages......');
	var total = 0;
	pool.getConnection(function(err, connection) {
		var total_Sql = 'select id from mynew';
		connection.query(total_Sql, function(err, result) {
			if(err) {
				console.log("total Error:" + err.message);
				return;
			}
			connection.release();
			total = result.length;
			callback(err, total);
		})
	})
}

//结果
function getResults(pageNum, callback) {
	console.log('into getResults......');
	var pageSize = 5;
	var startPage = pageNum * pageSize;
	pool.getConnection(function(err, connection) {
		var total_Sql = 'select * from mynew limit ? , ?';
		connection.query(total_Sql, [startPage, pageSize], function(err, result) {
			if(err) {
				console.log("total_Error:" + err.message);
				return;
			}
			connection.release();
			callback(err, result, pageSize);
		})
	})
}

router.post("/page", function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	console.log("page")
	var pageNum = req.body['pageNum'];
	console.log('pageNum:' + pageNum);
	var total = 0;
	getPages(pageNum, function(err, results) {
		if(err) {
			console.log('error!');
			res.send(err);
		} else if(results) {
			total = results;
			getResults(pageNum, function(err, results, pageSize) {
				var totalPage = Math.ceil(total / pageSize);
				var data = {
					total: total,
					pageSize: pageSize,
					totalPage: totalPage,
					list: results
				};
				res.send(data);
			})
		}
	});
});

module.exports = router;
(function($) {
		FR.$defaultImport('/com/fr/solution/theme/simple/files/jquery.nicescroll.min.js', 'js'); //引入自定义滚动条
     FR.$defaultImport('/com/fr/solution/theme/simple/files/jquery.slimscroll.min.js', 'js'); //引入纵向滚动条
		var moreIndex = 0;
		var iIndex = 0;
		var g_nodes = null;



		//重写FR._doResize方法
		FS._doResize = function(){ 
 			var head = FS.THEME.config4frame.north.visible ? (FS.THEME.config4frame.north.height || 60) : 0;
            var foot = FS.THEME.config4frame.south.visible ? 30 : 0;
            var clientWidth = document.body.clientWidth;
            var clientHeight = document.body.clientHeight;
            this.$body.css({
                height: clientHeight - head - foot,
                top: head
            });
            var w = this.$menu.width();
            this.$content.css({
                left: 0,  //只改动这个位置，content距左0， 宽度100%；
                width: clientWidth - 0
            });
            this.$footer.css({
                top: clientHeight - foot
            });
            if (this.tabPane) {
                var top = this.tabPane.element.height() - foot;
                if (this.tabPane.isExpanded()) {
                    top = 0;
                }
                this.tabPane.element.css('top', top);
                this.tabPane.doResize();
            }
		};

		window.onresize = function() {		

			//重新计算菜单可显示的数量

      			  _initNavList(g_nodes);
			$("#fs-frame-menu").html("");
			iIndex = 0;
			FS._initMenuTree(FS.THEME.config4MenuTree);

		}

		FS.THEME = $.extend(true, FS.THEME, {
			config4frame: {
				//上区域
				north: {
					height:100 //上方导航栏高度设置(不设置默认60px)
				},
				west: {
					width: 0
				}

			},
		
			config4navigation: {

				onAfterInit: function() {
				
					var self = this;

					//添加登录用户名过长的处理
					var $admin =  $("#fs-navi-admin").find("span");
					var spanName = $admin.text();
					$admin.attr("title", spanName);

					//处理数据决策系统名称
					$("#fs-frame-banner .fs-banner-title").attr("title",$("#fs-frame-banner .fs-banner-title").text());
					// $('#fs-frame-search').remove();
					//  var $reg = $('#fs-frame-reg');
					// if ($reg.length > 0) {
					//     $reg.remove();
					// }
					// 
					//收藏消息
					FS._showFavoriteCombo= function($obj, speed){
						 var self = this;
						 _showFavoriteFunc(self, $obj, speed);			       

					}


                $.ajax({
                    url: FR.servletURL + "?op=fs_main&cmd=module_getrootreports",
                    type: 'POST',
                    async: false,
                    data: {
                        id: -1
                    },
                    success: function(res, status) {
                        var nodes = $.parseJSON(res);

                        //add 2016.11.11 针对BI 菜单里的所有模板和我创建的 进行添加，暂时接口没提供  -begin--
                         if (FS.THEME.config4MenuTree.insertNodes) {
		                    $.each(FS.THEME.config4MenuTree.insertNodes, function(p, q) {
		                        if ($.isFunction(q)) {
		                            var o = q.apply();
		                            o && nodes.push(o)
		                        } else {
		                            nodes.push(q)
		                        }
		                    })
		                }
		                // add -end-

                        $.ajax({
                            url: FR.servletURL + "?op=fs_main&cmd=getmoduleitems",
                            type: 'POST',
                            async: false,
                            data: {
                                id: 1
                            },
                            success: function(res) {
                            	//add 2016.11.11  修改返回的是平台管理而不是管理系统字段 --begin---
                            	var tmp = $.parseJSON(res);
                            	//add 11/15  普通用户正常是看不到管理系统的
                            	if(tmp && tmp.hasChildren){ 
	                            	tmp.text = FR.i18nText("FS-Generic-Manager_System");
	                            	//add 2016.11.11  ---end---
	                                nodes.push(tmp);
	                            }   
                                g_nodes = nodes; //存到内存中
                            }
                        });
                       
                       //初始化菜单
                        _initNavList(nodes);
                      
                    }
                });



            }
            ,
            naviComponents : [
			    {
			        renderEl : $('<div id="bi-support"/>'),
			        render : function (renderEl) {
			            fixTools(this.$header);
			        },
			        visible : FS.config.supportModules.indexOf("bi") !== -1
			    }
			]
        },

        config4tabPane: {
          //tabHeight:40   //修改参数tab的高度，默认是30，否则计算fs-tab-content的高度会多10px
        },
        config4MenuTree: {
            onNodeCreate: function(node, $node, $li) {

                //一级目录
                if (1 == node.level) {
                    iIndex++;
                    if (iIndex > moreIndex) {
                        _createMoreMenu(node, $node, $li);

                    }
                } else {
                    //二级目录
                    _createMoreMenu(node, $node, $li);
                }
            },

            onAfterInit: function(node, $node, $parent) {

                iIndex = 0; //清空一下计数，否则firefox和ie下会不清零 add 11.04

                var wW = $(window).width();
                $('#fs-frame-content').css({
                    left: 0,
                    width: wW
                });


                _bindEvts(); //监听绑定右侧菜单数据

                if (-1 != FS.config.supportModules.indexOf("bi")) {
                	if (FS.config.isAdmin) {             		
                   		$("#fs-frame-search").css("right", "365px");
                	}else{ 
                		$("#fs-frame-search").css("right", "245px");
                	}
                	/*
                	if($("#bi-data-config").length == 0 && $("#bi-new-analysis").length == 0){

	                    $('<div id="bi-data-config" class=" bi-basic-button data-config-font"><i class="bi-single x-icon b-font horizon-center" style="width: 20px; height: 20px; position: relative; top: 0px; right: 4px; margin: 0px auto;"></i>数据配置</div>').insertBefore($("#fs-frame-search"));
	                    $('<div id="bi-new-analysis" class="bi-basic-button new-analysis-font"><i class="bi-single x-icon b-font horizon-center" style="width: 20px; height: 20px; position: relative; top: 0px;right: 4px; margin: 0px auto;"></i>新建分析</div>').insertBefore($("#fs-frame-search"));

                    	     $("#fs-frame-search").css("right", "150px");

	                    //新建分析
	                    $("#bi-new-analysis").click(function(e) {
	                        newBI();
	                    });
	                    //数据配置
	                    $("#bi-data-config").click(function(e) {
	                        dataSetting();
	                    });
                	}
                	*/
                }

            }
        }
		});
			
		


		var _createItem = function(node, $pane, $node) {
			return $('<a href="#"/>').text(node.text)
				.click(function() {
					FS.tabPane.addItem(node);
					$node.removeClass('node-select');
					$node.addClass("activeLi").siblings("li").removeClass("activeLi");
					//$node.css({
					//	'color': 'rgb(45,167,220)'
					//});
					$pane.hide();

				});
		};
		var _collectAllChildNodes = function(node, childs) {
			var self = this;
			if (!node.ChildNodes) {
				return;
			}
			$.each(node.ChildNodes, function(index, child) {
				if (child.hasChildren) {
					_collectAllChildNodes(child, childs);
				} else {
					childs.push(child);
				}
			});
		};

		//鼠标滑过菜单事件
		var _menuHover = function() {

			$('.node-navi li').bind({

				mouseenter:function(){ 
				    if($(this).children('div:first').hasClass("node-select")){ 

                    } else {
                        $(this).siblings("li").find(".node-pane").hide();
                        $(this).siblings("li").find(".title-level1").removeClass("node-select");
                    }
                    //$('.node-pane', this).slideUp(200);	
                    if ($(this).hasClass('special-more-li')) {

                        //显示右侧更多				
                        $("#fs-frame-menu").animate({
                            width: "228",
                            right: "0"
                        }, 200, function(callback) {

                        });

                    } else {
                        //隐藏更多菜单				
                        $("#fs-frame-menu").animate({
                            right: "-228px"
                        }, 200);

                        $('.node-pane', this).show();

                    }

                    
                    $(this).children('div:first').addClass("node-select");


                },
                mouseleave: function(e) {

                    // $('.node-pane', this).slideUp(200);
                    if($(e.relatedTarget).hasClass("nicescroll-cursors") || $(e.relatedTarget).hasClass("nicescroll-rails")){ 
                    	//因为滚动条在node-pane的外貌，所以要在移动到滚动条时，不隐藏
                    	return;

                    }else{ 
                    	$('.node-pane', this).hide();
                    	$(this).children('div:first').removeClass("node-select");	
                    }
                                     
                },

				click:function(e){ 
					e.stopPropagation();
				}
			}),


            $(this).unbind("mouseenter").unbind("mouseleave");

        //右侧菜单鼠标离开事件
        $("#fs-frame-menu").hover(function() {
            //暂不处理
        }, function() {
            $("#fs-frame-menu").animate({
                right: "-228px"
            }, 200);

			})

		};

    //判断当前页面能显示几个目录
    var _menuLength = function() {
        var wH = $(window).width();

        //var menuH = wH - 70 -164;
        var num = Math.floor(wH / 130);
        return num;
    };

    //重新计算一级菜单的高度
    var _redrawNodeLiWH = function(size, allLen) {
        var wH = $(window).width();
        //var menuH = wH - 70 -164;
        if (size < allLen) {
            //需要显示...
            if (wH % 130 < 40) {
                //如果剩余的小于40ox，不够显示...,此时重新计算每个一级菜单可显示的宽度（缩小）
                $(".node-navi-li").width(Math.floor((wH - 40) / size));
                $(".special-more-li").width(40);
            } else if (wH % 130 > 60) {
                //如果剩余的大于60ox，有点太大显示...,此时重新计算每个一级菜单可显示的宽度（放大）
                $(".node-navi-li").width(Math.floor((wH - 60) / size));
                $(".special-more-li").width(60);
            } else {
                //剩余宽度在40-60范围内，都可接受
                $(".special-more-li").width(wH % 130);
            }
        }

        //重新调整一级菜单的高度后，距离左侧的宽度也应该跟着调整
        _initHorizonScroll();
       

    };

		//计算二级菜单可以显示的宽度
		var _treeMenuLayout = function($pane) {
			var len = $pane.find(".node-wrapper").length;
			var len2 = $pane.find(".node-wrapper .node-title").length;
			var hasChildLen = $pane.find(".haschildnode").length;
			var thirdLen = $pane.find(".third-inner .third-title").length;
			if(1 == thirdLen){ 
				//只有三级菜单，隐藏左侧的竖线
				$pane.find(".third-inner .third-title").addClass("first-third");
			}
			$pane.find(".haschildnode").eq(hasChildLen - 1).addClass("last-childnode");

        
         //有子节点
         if (len == len2) {

                $pane.width(len2 * 　180);
                //如果每个子节点都有自己的子节点
                //$pane.width(len2 * 　183 + 20);
        }else if(1 == len && len2 == 0){
        	  //处理只有二级菜单没有三级菜单的情况，将其上移，空的40px去掉 add 11/10      	
        	$pane.find(".second-wapper").hide();

        }else if (len2 < len) {
            //如果只有某子节点有自己的子节点，其它的没有子节点
            $pane.width((len2 + 1) * 　180);

        }else{}

    };


    var _initHorizonScroll = function(){ 
    	 $(".node-pane").each(function(){ 
    	 	var bShowHoriz = false;
        	var li_Left = $(this).parent().offset().left; //一级菜单距离左边的距离
	        var wH = $(window).width(); //窗口的总宽度
	        var curentW = $(this).parent().width(); //当前菜单的宽度
	        var node_pane_w = $(this).width();
	        //缩小浏览器窗口，处理二级菜单宽度超过屏幕款的的情况
	        if (wH < node_pane_w) {
	        	bShowHoriz = true;
	            $(this).width(wH-2);
	            $(this).css("left", -li_Left);
	        } else if (wH - li_Left < node_pane_w) {
	            $(this).width(node_pane_w);
	            //二级菜单展开的宽度大于剩余的宽度，向左移动
	            $(this).css("left", -(node_pane_w - (wH - li_Left)) + "px");

	        } else {
	            $(this).width(node_pane_w);
	        }

	         //判断是否有二级及三级菜单
	        if (0 != $(this).find(".second-inner").children().length) {
	            if (bShowHoriz) {
	                $(this).niceScroll( {
	                    cursorcolor: "#ffffff",
	                    cursoropacitymax: 1,
	                    touchbehavior: false,
	                    cursorwidth: "10px",
	                    cursorborder: "0",
	                    cursorborderradius: "5px",
	                    background: "#0091bb",
	                     autohidemode: "false",
	                   
	                    horizrailenabled: true,
	                    cursordragontouch: true // 使用触屏模式来实现拖拽
	                });


	            }


	        }


        });
    }



    //初始化纵向滚动条
    var _initscroll = function() {

        $(".third-wrapper .third-inner").each(function(e) {
        	var vH = '168px';
        	if("none" == $(this).parent().parent().parent().find(".second-wapper").css("display")){ 
        		vH = '208px';
        		$(this).parent().parent().height(208);
        	}else{ 

        	}
           // $(this).height($(".third-title", this).height());

            $(this).slimScroll({
                // width: '200px',
                height: vH,
                size: '10px',
                position: 'right',
                alwaysVisible: true,
                railVisible: true,
                color: '#fff',
                railColor: '#0091bb',
                opacity: 1
            });

        });
		
			

    };

		//创建显示更多的菜单
		var _createMoreMenu = function(node, $node, $li) {

			var $node = $('<a class="menutree-node"/>').data('NODE', node);

        if (node.level === 1) {
            //一级目录
            $node.addClass("fs-menu-item").attr('title', node.text).appendTo($li);
            if (node.isModule) {
                //管理系统固定图标
                FS.createIconFont("icon-menu-setting-a", "icon-menu-setting-b").appendTo($node);
            } else {
                //bug79802,ie8默认8进制，改成10进制
                var icon = FS.config.folderIcons[parseInt(node.id, 10)];
                // 若图标不存在，使用默认图标
                icon = icon ? icon : 'e642';
                FS.createIconFont('icon-' + icon + '-a', 'icon-' + icon + '-b').appendTo($node);
            }
            $('<span/>').text(node.text).appendTo($node);
            if(!node.hasChildren){ 
            	$node.addClass("no-child");
            }
        } else {
            //子目录
            $node.addClass("fs-menu-item menutree-child")
                .attr('title', node.text)
                .css({
                    'padding-left': (node.level - 1) * 14 + 12
                })
                .appendTo($li);
            var $icon = $('<i class="tree-icon"/>').appendTo($node);
            if (node.hasChildren) {
                if (node.isexpand) {
                    // 收起图标
                    $icon.html('\ue624');
                } else {
                    // 展开图标
                    $icon.html('\ue61f');
                }
            } else {
                 $node.addClass("no-child");
                $icon.addClass('icon-tree-leaf icon-tree-' + node.nodeicon);
                
            }
            $('<span class="menutree-text"/>').text(node.text).appendTo($node);
        }

			return $node;

		};

		//绑定右侧更多里的事件
		var _bindEvts = function() {
			var doProxy = function(event) {
				//先隐藏横向展开的菜单
            			$(".node-pane").hide();

				var target = event.target;
				var $obj = $(target).closest('a.menutree-node');
				if ($obj && $obj.length > 0) {
					var type = event.type;
					if (type === 'mouseover') {
						$obj.addClass('fui-seb fui-fht');
					} else if (type === 'mouseout') {
						if (!$obj.hasClass('select')) {
							$obj.removeClass('fui-seb fui-fht');
						}
					} else if (type === 'click') {
						var node = $obj.data('NODE');
						FS.MenuTree.prototype.clickNode(node, $obj);
					}
				}
			};
			$("a.menutree-node").bind('mouseover', doProxy)
				.bind('mouseout', doProxy)
				.bind('click', doProxy);
		};


    var _initNavList = function(g_nodes) {

        var len = _menuLength(); //可放置菜单的长度
        moreIndex = len;
         var allLen = g_nodes.length; //所有菜单的长度

        $("ul.node-navi").remove();   
        var $ul = $('<ul class="node-navi"/>').appendTo($('#fs-frame-header'));
        $.each(g_nodes, function(index, root) {
            var $node = null
            if (index < len) {
                $node = $('<li class="node-navi-li"/>').appendTo($ul);
                var innerHtml = "<div  class='title-level1' title=" + root.text + "><span class='menu_item_icon menu_icon_" + index + "'></span>" + root.text + "</div>";
                $(innerHtml).appendTo($node);
                $('<div class="line">').appendTo($node);

            } else if (index == len) {
                $node = $('<li class="node-navi-li special-more-li"/>').appendTo($ul);
                innerHtml = "<div class='title-level1' title='更多'><span class='menu_item_more'>●●●</span></div>";
                $(innerHtml).appendTo($node);
                $('<div class="line">').appendTo($node);
                $("#fs-frame-menu").width(228);
						var $rightMenu = $('<div class="fs-menutree"></div>').appendTo($('#fs-frame-menu'));
						$ulParent = $('<ul/>').appendTo($rightMenu);
						
					} else {
            	return;
            }
            //鼠标滑过，显示下拉菜单
            $dropdown = $('<div class="node-pane" style="display:none;"/>').appendTo($node);
            var $pane = $('<div class="node-pane-inner"/>').appendTo($dropdown);
            var $second_wrapper = $('<div class="second-wapper"></div>').appendTo($pane);
            var $second_inner = $('<div class="second-inner"></div>').appendTo($second_wrapper);
            var $third_wrapper = $('<div class="third-wrapper"></div>').appendTo($pane);
             var $third_outer = $('<div class="third-outer"></div>').appendTo($third_wrapper);
              var $thirde_inner = $('<div class="third-inner"></div>').appendTo($third_outer);
            var $thirdpane = null;
            if (root.hasChildren && root.ChildNodes) {

									$.each(root.ChildNodes, function(index, child) {
										if (child.hasChildren) {
											
											var $w = $('<div class="node-wrapper haschildnode"/>').appendTo($second_inner);
											var $nodetitle = $('<div class="node-title"></div>').appendTo($w);
											$('<div class="node-title-inner"></div>').text(child.text).appendTo($nodetitle);
											if(0 == index){
												var $thirdTitle = $('<div class="third-title first-third"/>').appendTo($thirde_inner);
											}else{ 
												var $thirdTitle = $('<div class="third-title"/>').appendTo($thirde_inner);
											}
											
											var childs = [];
											_collectAllChildNodes(child, childs);
											$.each(childs, function(i, n) {
												_createItem(n, $dropdown, $node).appendTo($thirdTitle);
											});

                    } else {

                        if (0 == $thirde_inner.find(".third-no-child-title").length) {
                            var $w = $('<div class="node-wrapper nochild"/>').appendTo($second_inner);
                            $thirdpane = $('<div class="third-no-child-title third-title"/>').appendTo($thirde_inner);
                        }
                        _createItem(child, $dropdown, $node).appendTo($thirdpane);
                    }
                });
            } else {
            	//一级菜单没有子菜单
            	if($node && !$node.hasClass("special-more-li")){
	                  $node.click(function() {
						                FS.tabPane.addItem(root);
						                $node.removeClass('node-select');
						                $node.addClass("activeLi").siblings("li").removeClass("activeLi");
						                $pane.hide();

					});
              	}
            }

					_treeMenuLayout($pane);

        });
        _redrawNodeLiWH(len, allLen); //重新调整菜单的宽度，使其平均
        _menuHover();
        _initscroll();
 
    }

    //重写FS的收藏事件，只改了下面备注的地方
    var _showFavoriteFunc = function(self, $obj, speed) {
        //var self = this;
        var $wrapper = $obj.data('COMBO');
        if (!$wrapper) {
            $wrapper = $('<div class="fs-favorite-combo"/>')
                .hide().appendTo($obj);
            $obj.data('COMBO', $wrapper);
        }
        var head = FS.THEME.config4frame.north.visible ? (FS.THEME.config4frame.north.height || 60) : 0;
        var foot = FS.THEME.config4frame.south.visible ? 30 : 0;
        $wrapper.empty().css({
            height: document.body.clientHeight - head - foot,
            'z-Index': FR.widget.opts.zIndex++
        });
        $('<div class="fs-favorite-combo-title"/>')
            .text(FR.i18nText("FS-Generic-Simple_Favorite")).appendTo($wrapper);
        var $list = $('<div class="fs-favorite-combo-list"/>').appendTo($wrapper);
        // 生成收藏夹
        var nodes = self.Control.getFavoriteNodes();
        if (nodes && nodes.length > 0) {
            $.each(nodes, function(index, node) {
                var $node = $('<a href="#"/>').attr('title', node.entry.text).data('FAVORITE', node).appendTo($list);
                $('<span/>').text(node.entry.text).appendTo($node);
                var $del = $('<i class="icon-remove-favorite"/>').hide().appendTo($node);
                $node.hover(function() {
                    $del.show();
                }, function() {
                    $del.hide();
                })
            });
            $wrapper.click(function(e) {
                var $target = $(e.target);
                var $entry = $target.closest('a');
                var node = $entry.data('FAVORITE');
                if ($entry && $entry.length > 0) {
                    if ($target.hasClass('icon-remove-favorite')) {
                        //删除收藏
                        self.Control.removeFavoriteNode(node.id, function() {
                            $entry.remove();
                        });
                    } else {
                        //打开收藏
                        $wrapper.hide();
                        self.loadContentByEntry(node.entry);
                    }
                }
            });
        }
        $list.slimscroll({
            position: 'relative',
            width: '260px',
            height: (document.body.clientHeight - 97 - 60) + 'px' //备注：这里之前是写死的112px, 因为高度由60->97了，所以会有问题。这里把高度设置小一点了
        });
        $wrapper.slideDown(speed);
    }
    
     /*add 11/15 添加BI 换第一种方法，正常普通用户下看不到数据配置*/
    var fixTools = function ($header) {
    if (FS.config.supportModules.indexOf("bi") === -1) {
        return;
    }
    var header = BI.createWidget({
        type: "bi.absolute",
        element: $header
    });
    var newAnalysis = BI.createWidget({
        type: "bi.icon_text_item",
        cls: "new-analysis-font bi-new-analysis-button",
        text: BI.i18nText('BI-Add_Analysis'),
        height: 60,
        width: 120,
        iconWidth: 20,
        iconHeight: 20
    });
    newAnalysis.on(BI.IconTextItem.EVENT_CHANGE, function () {
        var id = BI.UUID();
        var newAnalysisBox = BI.createWidget({
            type: "bi.new_analysis_float_box"
        });
        newAnalysisBox.on(BI.NewAnalysisFloatBox.EVENT_CHANGE, function (data) {
            BI.requestAsync("fr_bi", "add_report", {
                reportName: data.reportName,
                reportLocation: data.reportLocation,
                realTime: data.realTime
            }, function (res, model) {
                if (BI.isNotNull(res) && BI.isNotNull(res.reportId)) {
                    FS.tabPane.addItem({
                        title: data.reportName,
                        src: FR.servletURL + "?op=fr_bi&cmd=init_dezi_pane&reportId=" + res.reportId + "&edit=_bi_edit_"
                    });
                }
            });
        });
        BI.Popovers.create(id, newAnalysisBox, {width: 400, height: 320}).open(id);
        newAnalysisBox.setTemplateNameFocus();
    });
    header.addItem({
        el: newAnalysis,
        right: 290,
        top: -2,
        bottom: 0
    });
    if (FS.config.isAdmin) {
        var dataConfig = BI.createWidget({
            type: "bi.icon_text_item",
            cls: "data-config-font bi-data-config-button",
            text: BI.i18nText("BI-Data_Setting"),
            height: 60,
            width: 120,
            iconWidth: 20,
            iconHeight: 20
        });
        dataConfig.on(BI.IconTextItem.EVENT_CHANGE, function () {
            FS.tabPane.addItem({
                title: BI.i18nText('BI-Data_Setting'),
                src: FR.servletURL + '?op=fr_bi_configure&cmd=init_configure_pane'
            });
        });
        header.addItem({
            el: dataConfig,
            right: 290,
            top: -2,
            bottom: 0
        });
        header.attr("items")[0].right = 400;
        header.resize();
    }
}
})(jQuery);
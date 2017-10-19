(function($) {
    //引入文件
    FR.$defaultImport('/com/fr/solution/theme/metro/files/jquery.nicescroll.min.js', 'js'); //引入自定义滚动条

    FR.$defaultImport('/com/fr/solution/theme/metro/files/jquery.bxslider.css', 'css'); //引入轮播式样
    FR.$defaultImport('/com/fr/solution/theme/metro/files/jquery.bxslider.js', 'js'); //引入轮播
    var swiper = null;
	
    var slider = null;
    var timerId = null;
    var bshowGoon=false;

    var oldpagex, oldpagey;

    FS.THEME = $.extend(true, FS.THEME, {
        config4navigation: {
            onAfterInit: function() {
                var self = this;
                //添加登录用户名过长的处理
                var $admin = $("#fs-navi-admin").find("span");
                var spanName = $admin.text();
                $admin.attr("title", spanName);
                //$('#fs-frame-search').remove();
                //var $reg = $('#fs-frame-reg');
                //if ($reg.length > 0) {
                 //   $reg.remove();
                //}

                //替换Logo图片
                //$("#fs-frame-banner .fs-banner-logo").attr("src", "/WebReport/ReportServer?op=resource&resource=/com/fr/solution/theme/metro/files/logo.png");
            },
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
        config4frame: {
            west: {
                width: 0
            }
        },
        config4tabPane: {
            onCreateTab: function($tab, entry) {

            },
            onSelectTab: function($tab, $content, entry) {
                //$(".menu-bg-overlay").removeClass("menu-overlay-show");		

            },
            onCloseTab: function($tab, $content, entry) {
                //$(".menu-bg-overlay").removeClass("menu-overlay-show");	

            }

        },
        config4MenuTree: {
            onAfterInit: function() {



                mainMenu.init();
            }
        }
    });
    var _createItem = function(node, $pane, $node) {
        return $('<a href="#"/>').text(node.text)
            .click(function() {
                FS.tabPane.addItem(node);
                $node.removeClass('node-select');
                $node.addClass("activeLi").siblings("li").removeClass("activeLi");
                $pane.hide();
                $(document).unbind('mousedown.nodepane');

                // _initSliderWrapper();
                if ($(window).width() < 1024) {
                    $("#menu_nav_menu li").css("margin-left", "auto");

                } else {
                    $("#menu_nav_menu li").removeClass("leftP");
                }
                $(".menu-bg-overlay").removeClass("menu-overlay-show");

                //移除弹框
                $(".menu-bg-overlay").removeClass("menu-overlay-show");

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

    var mainMenu = {

        init: function() {
            mainMenu._initMainMenu();
            mainMenu._initMenuListData();
            mainMenu._initbindEvent();
            FS.tabPane._resizeTabs = function() {
              
                var d = this;
                var g = this.element.width(),
                    b = this.element.height();
                var i = g - 40;
                if (this.options.isCollapsible) {
                    i -= 60
                }
                if (this.options.hasHomepageBtn) {
                    i -= 60
                }
                i -= 60;//减去左侧icon的宽度，初始化tab的长度，默认是-60-40的，现在左侧多出60的icon，所以用总长度减去width - 60-40-60
                this.$tabs.width(i);
                var f = this.$tabs.children();
                var e = Math.floor(i / this.options.tabWidth) + 1;
                var c = this.options.tabWidth;
                if (f.length >= e) {
                    c = Math.floor(i / e)
                }
                this.visibleTabCount = e;
                if (c !== this.currentTabWidth) {
                    this.dropdownLeft = Math.floor((c - this.options.dropBoxWidth) / 2);
                    $.each(f, function(j, k) {
                        $(k).outerWidth(c);
                        $(".fs-tab-item-label", $(k)).outerWidth(c - 20)
                    });
                    this.currentTabWidth = c
                }
                this.$content.width(g).height(b - this.options.tabHeight);
                try{
	                if (this.isFullScreen()) {
	                    this.$content.width(g).height(b)
	                }
	            }catch(e){}
                this.fireEvent("resize", {
                    width: g,
                    height: b - this.options.tabHeight
                });
                var h = this._getSelectedTab();
                if (h !== null) {
                    this._doSelectTab(h)
                }
            };

        },

        //生成主菜单HTML
        _initMainMenu: function() {
                //插入总按钮
                var innerHtml = '<div class="button-trigger"><button class="menu-trigger" id="total_trigger">' +
                    '<img src="${servletURL}?op=resource&resource=/com/fr/solution/theme/metro/files/m_toggler.png" alt=""></button></div>';


                var menu_bg_overlayhtml = '<div class="menu-bg-overlay" id="menu_overlay"><div id="menu_wrapper" class="section1"><button class="menu-close">×</button><button id="slide_btn" class="slide-btn">轮播</button>' +
                    '<div class="menu-overlay menu-overlay-bg-transparent">' +
                    '<div class="menu-overlay-content">' +
                    '<ul class="menu-overlay-nav text-uppercase node-navi" id="menu_nav_menu">' +
                    // '<li> <a href="#">Dashboard</a> </li>'+
                    // '<li><a href="#">Reports</a></li>'+
                    // '<li><a href="#">Templates</a> </li>'+
                    // '<li><a href="#">Support</a> </li>'+
                    // '<li> <a href="#">Settings</a></li>'+
                    '</ul> <div id="newTabMenu" class="fs-tab ui-state-enabled bravo"></div></div></div>'

            '</div>';
            var tab_slider_html = '<div class="slide-tab-wrapper" id="slide_tab_wrapper">'+
            	'<button class="menu-close-slider" id="menu_close_slide">×</button>'+
                '<div class="go-btn"><span class="go-icon">继续播放</span></div>' +
            	'<div id="banner" class="swiper-container">' +              
                '<div class="bxslider" id="swiper_wrapper_tab">' +
                '</div></div></div>';

            $(innerHtml).insertBefore($("#fs-frame-content .fs-tab-homepage"));
                $(menu_bg_overlayhtml).appendTo($(".button-trigger"));
                $(tab_slider_html).appendTo($("#menu_overlay"));

            if(FS.config.supportModules.indexOf("bi") != -1){
            	/*bi下重新调整搜索框和注册的位置*/
            	if (FS.config.isAdmin) {
            		$("#fs-frame-reg").css("right", "270px");
                   	$("#fs-frame-search").css("right", "250px");
            	}else{ 
            		$("#fs-frame-reg").css("right", "130px");
                   	$("#fs-frame-search").css("right", "110px");	
            	}
               	/*这种方法添加BI没有考虑到权限的问题，所以换方法*/
	       /*   
	        if($("#bi-data-config").length == 0 && $("#bi-new-analysis").length == 0){
	                $('<div id="bi-data-config" class=" bi-basic-button data-config-font"><i class="bi-single x-icon b-font horizon-center" style="width: 20px; height: 20px; position: relative; top: 0px; right: 4px; margin: 0px auto;"></i>数据配置</div>').insertBefore($("#fs-frame-search"));
	                $('<div id="bi-new-analysis" class="bi-basic-button new-analysis-font"><i class="bi-single x-icon b-font horizon-center" style="width: 20px; height: 20px; position: relative; top: 0px;right: 4px; margin: 0px auto;"></i>新建分析</div>').insertBefore($("#fs-frame-search"));

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
            //初始化tab的长度，默认是-60-40的，现在左侧多出60的icon，所以用总长度减去width - 60-40-60
            $(".fs-tab-names").width($(window).width() - 60 - 100);
            slider = $('.bxslider').bxSlider({
	            auto: true,
                pause: 6000, //每两个自动渐变之间的时间间隔				
	            //autoHover:true,
	            controls:true
	        });


	        //监听控制器小图标的切换，切换后暂停播放，添加继续播放功能
	        $(".swiper-container").on("click", " .bx-pager-item a",function(){         	
	        	 $(".go-btn").show();
	        });

            //监听继续播放
            $(".go-btn").click(function(e) {
                slider.startAuto();
                bshowGoon=false
                $(this).hide();

	        });
            //timer触发器

            
            $(".swiper-container").mouseleave(function(e) {
                clearTimeout(timerId);
                if ($(e.relatedTarget).hasClass("go-btn")|| $(e.relatedTarget).hasClass("go-icon") || $(e.relatedTarget).hasClass("bx-next") || $(e.relatedTarget).hasClass("bx-prev") || $(e.relatedTarget).hasClass("bx-default-pager") ||  $(e.relatedTarget).hasClass("bx-pager-link") ||$(e.relatedTarget).hasClass("menu-close-slider")){
                    bxslider.show();
                    return false;
                }
                bxslider.hide();
            });

            $(".swiper-container").mousemove(function(e) {

                if (oldpagex != e.pageX || oldpagey != e.pageY) {
                    oldpagex = e.pageX;
                    oldpagey = e.pageY;

                    clearTimeout(timerId);
                    bxslider.show();

                    //重新设置一个timer
                    timerId = setTimeout(function() {
                        bxslider.hide();
                    }, 30000);


                }
            });


            $(".swiper-container").hover(function(e){         	  
                    bxslider.show();
            },function(e){ 
            	/*  clearTimeout(timerId);
            	   if ($(e.relatedTarget).hasClass("go-btn")|| $(e.relatedTarget).hasClass("go-icon") || $(e.relatedTarget).hasClass("menu-close-slider")){
                    bxslider.show();
                    return false;
                   }
            	   bxslider.hide();*/
            });
           
           

        	},

        //ajax请求菜单列表数据
        _initMenuListData: function() {


            $.ajax({
                url: FR.servletURL + "?op=fs_main&cmd=module_getrootreports",
                type: 'POST',
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
                           

                        }
                    });
                    //var $ul = $('<ul class="node-navi"/>').appendTo($('#fs-frame-header'));
                    var $ul = $("#menu_nav_menu");
                    $.each(nodes, function(index, root) {
                        var $node = $('<li class="node-navi-li"/>').appendTo($ul);

                        $('<div class="title-level1"/>').text(root.text)
                            .appendTo($node)
                            .click(function(event) {
                                //取消事件冒泡
                                event.stopPropagation();
                                _hideMenu(event);

                                //移动一级菜单位置
                                if ($(window).width() < 1024) {
                                    $("#menu_nav_menu li").css("margin-left", "0");
                                } else {
                                    $("#menu_nav_menu li.node-navi-li").addClass("leftP");
                                    //$("#menu_nav_menu li.node-navi-li").animate({"left":"15%"},300);
                                }
                                //清空上一次状态
                                _clearStatus();

                                    if ($node.hasClass('node-select')) {
                                        return;
                                    }
                                    $ul.find('.node-select').removeClass('node-select');
                                    $node.addClass('node-select');
                                    var $dropdown = $(this).data('DATA');
                                    if (!$dropdown) {
                                        $dropdown = $('<div class="node-pane"/>').appendTo($node);
                                        $(this).data('DATA', $dropdown);

                                        if (root.hasChildren && root.ChildNodes) {

                                            var $pane = $('<ul class="node-pane-inner"/>').appendTo($dropdown);
                                            //var $rightpane = $('<div class="node-pane-right">').appendTo($dropdown);
                                            if (root.hasChildren && root.ChildNodes) {

                                                $.each(root.ChildNodes, function(index, child) {
                                                    if (child.hasChildren) {
                                                        var $w = $('<li class="node-wrapper"/>').appendTo($pane);
                                                        $('<div class="node-title"/>').text(child.text).appendTo($w);
                                                        var $third = $('<div class="node-childs"/>').appendTo($w);
                                                        var childs = [];
                                                        _collectAllChildNodes(child, childs);
                                                        $.each(childs, function(i, n) {
                                                            _createItem(n, $dropdown, $node).appendTo($third);
                                                        });
                                                    } else {
                                                        var $other = $('<li class="node-wrapper"/>').appendTo($pane);
                                                        _createItem(child, $dropdown, $node).appendTo($other);
                                                    }
                                                });
                                            }
                                        } else {
                                        _clickNochildFirstMenu($node, root);

                                    }
                                } else {
                                    if (!root.hasChildren || !root.ChildNodes) {
                                        _clickNochildFirstMenu($node, root);
                                    }
                                }

                                    // _initNodeWrapper();
                                    _initNodePanePostion();
                                    _initNodePaneScroll();
                                    _bindEvent();

                                $dropdown.fadeIn('fast');
                            });
                    });

                        _initscroll();

                    }
                });


        },


        //add 2016.11.11  --end---

        //
        _initbindEvent: function() {

            //鼠标滑过总菜单
            $("#total_trigger").hover(function() {
                $(this).find("img").attr("src", "${servletURL}?op=resource&resource=/com/fr/solution/theme/metro/files/m_toggler_hover.png");

            }, function() {

                //鼠标移走
                $(this).find("img").attr("src", "${servletURL}?op=resource&resource=/com/fr/solution/theme/metro/files/m_toggler.png");
            });
            //
            //打开
            $("#total_trigger").click(function() {
                //点击左上角button

                $("#newTabMenu .fs-tab-btns").show();
                $("#menu_wrapper").fadeIn();
                $("#slide_tab_wrapper").fadeOut('fast');
                $(".menu-bg-overlay").addClass("menu-overlay-show");
            });


                //关闭
                $(".menu-close").click(function() {
                    if ($(window).width() < 1024) {
                        $("#menu_nav_menu li").css("margin-left", "auto");

                    } else {
                        $("#menu_nav_menu li").removeClass("leftP");
                    }
                    $(".menu-bg-overlay").removeClass("menu-overlay-show");

                });

                //轮播
                //
                $("#slide_btn").click(function(e) {
                    e.stopPropagation();
                    $("#menu_wrapper").fadeOut("fast");
                    $("#slide_tab_wrapper").fadeIn();
                    _initSwiperSlide();

                });

                //浮层
                $(".menu-bg-overlay").click(function(e) {
                    e.stopPropagation();
                /*if ($(window).width() < 1024) {
                    $("#menu_nav_menu li").css("margin-left", "auto");

                } else {
                    $("#menu_nav_menu li").removeClass("leftP");
                }
                $(this).removeClass("menu-overlay-show");
                */
                // 
                //隐藏二级菜单
                _hideMenu(e);
            });

                //tab——iframe浮层
                //重写翻页按钮，否则会发生冒泡事件
                $(".arrow-left, .arrow-right").click(function(e) {
                    e.stopPropagation();
                });

            //关闭轮播
            $("#menu_close_slide").unbind('click').click(function(e) {
                e.stopPropagation();
                $("#slide_tab_wrapper").fadeOut("fast");
                $("#menu_wrapper").fadeIn();

                 $(".go-btn").hide();
            })

        }


    }



    //初始化菜单滚动条
    var _initscroll = function() {
        /*$(".node-pane-inner").slimScroll({ 
             color: 'red'
        });*/

        $("#menu_nav_menu").niceScroll({
            cursorcolor: "#d8d8d8",
            cursoropacitymax: 1,
            touchbehavior: false,
            cursorwidth: "10px",
            cursorborder: "0",
            cursorborderradius: "5px",
            background: "#0091bb",
            horizrailenabled: true
        });
    };

    var _initNodePaneScroll = function() {

        $(".node-pane-inner").niceScroll({
            cursorcolor: "#ffffff",
            cursoropacitymax: 1,
            touchbehavior: false,
            cursorwidth: "10px",
            cursorborder: "0",
            cursorborderradius: "5px",
            background: "#0091bb",
            horizrailenabled: false
        });

    }


    //初始化二级菜单的位置，最底到底部
    var _initNodePanePostion = function() {
        var nodePaneList = $(".node-pane");
        var menuUlH = $(".menu-overlay-nav").height();
        var nodeLi = null;
        var nodeTop = null;
        var nodeH = null;
        var nodeLibottom = null;
        for (var index = 0; index < nodePaneList.length; index++) {

            nodeLi = $(nodePaneList[index]).parent();
            nodeTop = nodeLi.get(0).offsetTop;
            nodeH = nodeLi.get(0).offsetHeight;
            nodeLibottom = menuUlH - nodeTop - nodeH;
            var nodeRightH = $(nodePaneList[index]).outerHeight(true);
            //如果右侧二级菜单的高度大于总高度，不修改式样
            if (nodeRightH > menuUlH) {
                $(nodePaneList[index]).css("top", -(nodeTop - 10));
                $(nodePaneList[index]).find(".node-pane-inner").css("max-height", menuUlH - 20);
            }
            //如果下面放不下菜单，将向上移动位置
            else if (nodeLibottom < nodeRightH) {
                //   
                if (nodeRightH > nodeTop) {
                    $(nodePaneList[index]).css("bottom", -(nodeRightH - nodeTop - 5));
                } else {
                    $(nodePaneList[index]).css("bottom", 5);
                }

            } else {

            }


           //_initThirdMenuPostion($(nodePaneList[index]).find(".node-childs"), menuUlH, nodeTop); //初始化三级菜单位置

        }

        _bindSecondMenu();

    }


    var _bindSecondMenu = function(){ 

    		$(".node-pane .node-title").click(function(e){ 
				var thirdChilds = $(this).parent().find(".node-childs");
				var menuUlH = $(".menu-overlay-nav").height();
				var parentsNodeTop = $(this).parent().parent().parent().parent(".node-navi-li");
				var childH = $(thirdChilds).outerHeight(true);

        		var childBottom = menuUlH - parentsNodeTop - childH;
        		if (childH > menuUlH) {

	                $(thirdChilds).css("top", -(childTop - 10));
	                $(thirdChilds).css("max-height", menuUlH - 20);

	            } else if (childBottom < childH) {

	                $(thirdChilds).css("bottom", 0);

	            } else {


	            }


    		});
    }

    var _initThirdMenuPostion = function(childMenuList, menuUlH, childTop) {

        //var  childMenuList = $(".node-childs");
        //var menuUlH = $(".menu-overlay-nav").height();
        var parentLi = null;
        //var childTop = null;
        var childH = null;
        var childBottom = null;
        for (var index = 0; index < childMenuList.length; index++) {
            parentLi = $(childMenuList[index]).parent();
            //childTop = parentLi.get(0).offsetTop;
            childH = $(childMenuList[index]).outerHeight(true);
            childBottom = menuUlH - childTop - childH;
            if (childH > menuUlH) {

                $(childMenuList[index]).css("top", -(childTop - 10));
                $(childMenuList[index]).css("max-height", menuUlH - 20);

            } else if (childBottom < childH) {

                $(childMenuList[index]).css("bottom", 0);

            } else {


            }



        }


    }

    //初始化
    var _initSwiperSlide = function() {

        _initSliderWrapper();
       	 $("#swiper_wrapper_tab li .fs-tab-content-item").css("display", "block");//修改平台管理有些无法轮播的bug，是用div套的
	   //	$("#swiper_wrapper_tab li iframe").css("display", "block");
	    slider.reloadSlider();
         $('.bxslider  iframe').each(function() {

                bubbleIframeMouseMove(this);

    });

    function bubbleIframeMouseMove(iframe){
        // Save any previous onmousemove handler
        var existingOnMouseMove = iframe.contentWindow.onmousemove;

        // Attach a new onmousemove listener
        iframe.contentWindow.onmousemove = function(e){

             if (oldpagex != e.pageX || oldpagey != e.pageY) {
                        oldpagex = e.pageX;
                        oldpagey = e.pageY;

                        clearTimeout(timerId);
                        bxslider.show();

                        //重新设置一个timer
                        timerId = setTimeout(function() {
                            bxslider.hide();
                        }, 30000);

            }

        // Fire any existing onmousemove listener 
        if(existingOnMouseMove) existingOnMouseMove(e);

        // Create a new event for the this window
        var evt = document.createEvent("MouseEvents");

        // We'll need this to offset the mouse move appropriately
        var boundingClientRect = iframe.getBoundingClientRect();

        // Initialize the event, copying exiting event values
        // for the most part
        evt.initMouseEvent( 
            "mousemove", 
            true, // bubbles
            false, // not cancelable 
            window,
            e.detail,
            e.screenX,
            e.screenY, 
            e.clientX + boundingClientRect.left, 
            e.clientY + boundingClientRect.top, 
            e.ctrlKey, 
            e.altKey,
            e.shiftKey, 
            e.metaKey,
            e.button, 
            null // no related element
        );

        // Dispatch the mousemove event on the iframe element
        iframe.dispatchEvent(evt);
    };
}
    }
    var _initSliderWrapper = function() {

        var frame_wrapper_list = $(".fs-tab-content .fs-tab-content-item"); //获取所有tab对应的iframe
        $("#swiper_wrapper_tab li").remove();
        var tmpIframe = null;
        //默认第一个不添加到轮播里
        for (var index = 1; index < frame_wrapper_list.length; index++) {
            tmpIframe = frame_wrapper_list[index]; //
            $(tmpIframe).width("100%");
            $(tmpIframe).height("100%");
            $("#swiper_wrapper_tab").append('<li>' + tmpIframe.outerHTML + '</li>');

        }

        //	$("#menu_overlay").append(innerHtml);

    }

    //绑定事件
    var _bindEvent = function() {

        //绑定二级菜单事件
        $(".node-pane-inner .node-title").click(function(e) {
            e.stopPropagation();

            _clearStatus();
            $(this).parent().addClass("active");
            //如果有三级菜单
            if ($(this).next().hasClass("node-childs")) {
                $(this).next().toggle();
            }

        })

    };

    //清空式样
    function _clearStatus() {
        $(".node-childs").hide(); //隐藏其它的子菜单
        $(".node-wrapper").removeClass("active");

    }

    //点击空白处，隐藏二级菜单、三级菜单
    function _hideMenu(e) {

        var _con = $(".node-pane");
        if (!_con.is(e.target) && _con.has(e.target).length === 0) {
            $(".node-navi-li").removeClass('node-select');
            _con.fadeOut('fast');
        }


    }

     //++++++
            //add 10/21 显示内容和隐藏内容的操作
            //+++++++
    var bxslider = {

        show: function() {
            $(".bx-wrapper .bx-controls-direction").show();
            $("#menu_close_slide").show();
            //如果之前是显示的，这里再显示出来
            if (true == bshowGoon) {
                $(".go-btn").show();
            }

        },
        hide: function() {
            $(".bx-wrapper .bx-controls-direction").hide();
            $("#menu_close_slide").hide();
            //如果之前继续播放显示了，这里置个标志位
            if ("block" == $(".go-btn").css("display")) {
                bshowGoon = true;
            } else {
                bshowGoon = false;
            }
            $(".go-btn").hide();
        }
    }

    //add 2016.11.11  --begin---
    var _clickNochildFirstMenu = function($node, root) {
            FS.tabPane.addItem(root);
            $node.removeClass('node-select');
            $node.addClass("activeLi").siblings("li").removeClass("activeLi");


            $(document).unbind('mousedown.nodepane');

            // _initSliderWrapper();
            if ($(window).width() < 1024) {
                $("#menu_nav_menu li").css("margin-left", "auto");

            } else {
                $("#menu_nav_menu li").removeClass("leftP");
            }
            $(".menu-bg-overlay").removeClass("menu-overlay-show");

            //移除弹框
            $(".menu-bg-overlay").removeClass("menu-overlay-show");

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
        right: 190,
        top: 0,
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
            right: 200,
            top: 0,
            bottom: 0
        });
        header.attr("items")[0].right = 320;
        header.resize();
    }
}
})(jQuery);

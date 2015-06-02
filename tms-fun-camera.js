;document.write("<script src='http://g.alicdn.com/??mui/tmm/2.2.6/tmm.js,hybrid/api/2.0.1/hybrid.min.js'></script>");
;document.write("<script src='http://h5.m.taobao.com/app/fun/mods/seajs/index.js'></script>");

/**
 * Seajs Config
 */
;seajs.config({
    base: "http://h5.m.taobao.com/app/fun/mods/",
    alias: {
        "zepto": "zepto/core",
        "cstore": "cstore/index"
    }
});
;define(function(require, exports, module){
    var $ = require('zepto/index'),
        bridgeInstance = new (require("bridge/index"));
    var Cstore = require('cstore/index');

    //设置API
    Cstore.setAPI({
        'labelDetail':{
            api : "mtop.tmall.sak.funer.SorLabelMtopApi.fetchLabelDetail",//接口路径
            listener : ['data.labelId'], //侦听改变的key 必填
            limit : 1
        }    
    });
    /**

     * @class tmsFunCamera
     * @constructor
     */
    function tmsFunCamera() {
        this.init.apply(this, arguments);
    }

    /**
     * 默认模板
     * @property TEMPLATES
     * @static
     */
    tmsFunCamera.TEMPLATES = {
        content: '<div class="photo-post" id="J_createPost" style="width: 75px;height: 48px;margin-left: -38px;background: #dd2727 url(../../imgs/icons/camera20150525.png) no-repeat 50% 50%;background-size: 44% 56%;position: fixed;bottom: 0px;left: 50%;z-index: 10;top: auto;"></div>'
    };

    /**
     * 默认属性
     * @property ATTRS
     * @static
     */
    tmsFunCamera.ATTRS = {
        callerName: "h5acttopic"
    }

    $.extend(tmsFunCamera.prototype, {
        /**
         * config:
         *      labelId:    labelId，指向要发图的话题列表的labelId
         *      domNode:    node 引用，拍照按钮dom
         *      callerName: spm埋点信息，指定从某个渠道进入拍照
         *      onSuccess:  发帖成功的回调
         *      notTmall:  非猫客环境执行的方法
         */
        config: {},

        domNode: {},

        topicArrayReference: [],

        init: function( params ){
            var self = this,
                content = tmsFunCamera.TEMPLATES.content;
            this.config = $.extend({}, tmsFunCamera.ATTRS, params);
            this.domNode = $(this.config.domNode);
            
            //获取labelDetail对象
            Cstore.get('labelDetail',{
                v:'1.0',
                data:{'labelId': this.config.labelId}
            },function (cstore) {
                var topicReference = cstore.data.data.model;
                self.topicArrayReference[0] = topicReference;
               
            },function (cstore) {
                console.log('topic cstore',cstore);
            });


        },
        startup: function(){
            var config = this.config;

            $(this.domNode).on('tap',function(){
                if ( !bridgeInstance.isTmall() ) {
                    if ( $.isFunction(notTmall) )
                        notTmall();
                }
                var withLabels = self.topicArrayReference, onSuccess = config.onSuccess;

                bridgeInstance.sendPost({
                        withLabels: withLabels,
                        callerName: config.callerName
                    },

                    function( data ){
                        if ( data.ret == 1){
                            bridgeInstance.loading(false);
                            if ( $.isFunction(onSuccess) )
                                onSuccess();

                        }
                        else if ( data.ret == -1){
                            bridgeInstance.loading(false);
                        }
                        else if ( data.ret == -2 ){
                            bridgeInstance.loading(true);
                        }
                        else if ( data.ret == -5 || data.ret == 0 ){
                            bridgeInstance.loading(false);
                            bridgeInstance.toast("上传失败请重试");
                        }

                    }
                );

            }); 
        }
    });

    module.exports = tmsFunCamera;
})
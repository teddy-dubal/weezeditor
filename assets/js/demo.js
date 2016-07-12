var WeezPdfEngine = (function ($, _, fabric) {
    fabric.Object.prototype.toObject = (function (toObject) {
        return function () {
            return fabric.util.object.extend(toObject.call(this), {
//                id: this.id,
                tag: this.tag
            });
        };
    })(fabric.Object.prototype.toObject);

    var $canvas = new fabric.Canvas('container', {
        backgroundColor: 'green',
        height: fabric.util.parseUnit('297mm'),
        width: fabric.util.parseUnit('210mm'),
    });
    var _debug = true;
    var _updateForm = function (_data) {
        var targetFormInput = $('#form').find('input,select,textarea');
        $.each(targetFormInput, function (index, _elt) {
            var res = _elt.id;
            if (typeof _data[res] != "undefined") {
                try {
                    $(_elt).val(_data[res]);
                } catch (e) {
                }
            }
        });
    };

    /**
     *
     * @returns {undefined}
     */
    var initToolbox = function () {
        $('#toolbox #text').on('click', function (e) {
            var coord = getRandomLeftTop();
            var text = 'Lorem ipsum\nLorem ipsum';
            var itext = new fabric.IText(text, {
                left: coord.left,
                top: coord.top,
                fontFamily: 'helvetica',
                angle: 0,
                fill: '#' + getRandomColor(),
                fontWeight: '',
                originX: 'left',
                hasRotatingPoint: true,
                centerTransform: true
            });

            $canvas.add(itext);
        });
        $('#toolbox #img').on('click', function (e) {
            var coord = getRandomLeftTop();
            fabric.Image.fromURL('/pdf/Homer_Dog_Tapped_Out.png', function (image) {
                image.set({
                    left: coord.left,
                    top: coord.top,
//                    angle: getRandomInt(-10, 10),
                    crossOrigin: 'anonymous'
                }).setCoords();
                $canvas.add(image);
            });
        });
        $('#toolbox #qrcode').on('click', function (e) {
            console.info('qrcode');
        });
        $('#toolbox #barcode').on('click', function (e) {
            console.info('barcode');
        });
    };
    /**
     *
     * @returns {undefined}
     */
    var initBtn = function () {
        var ajaxObj = {
            type: "POST",
            url: "ajax/save.php",
            data: {}
        };
        $("#saveData").click(function () {
            $canvas.deactivateAll().renderAll();
            ajaxObj.data.json = JSON.stringify($canvas);
            ajaxObj.data.img = $canvas.toDataURL('png');
            ajaxObj.data.file = $('#persoFile').val();
            $.ajax(ajaxObj).done(function (msg) {
                //alert("Data Saved: ");
            });
        });
        $("#duplicateData").click(function () {
            $canvas.deactivateAll().renderAll();
            ajaxObj.data.json = JSON.stringify($canvas);
            ajaxObj.data.file = $('#persoFile').val();
            ajaxObj.data.duplicate = true;
            $.ajax(ajaxObj).done(function (msg) {
                //alert("Data Saved: ");
                window.location.reload();
            });
        });
        $("#importJson").click(function () {
            var url = '/data/perso/' + $('#persoFile').val();
            $.getJSON(url, function (data) {
                $canvas.loadFromJSON(data, function () {
                    $canvas.renderAll();
                });
            });
        });

        $("#exportImg").click(function () {
            $canvas.deactivateAll().renderAll();
            if (!fabric.Canvas.supports('toDataURL')) {
                alert('This browser doesn\'t provide means to serialize canvas to an image');
            } else {
                window.open($canvas.toDataURL('png'));
            }
        });
        $("#exportJson").click(function () {
            console.info(JSON.stringify($canvas));
        });

        $("#validateEditorboxBtn").click(function () {
            var activeElement = $canvas.getActiveObject();
            $.each($('#form').serializeArray(), function (index, _elt) {
                if ($.isNumeric(_elt.value)) {
                    activeElement.set(_elt.name, parseFloat(_elt.value)).setCoords();
                } else {
                    activeElement.set(_elt.name, _elt.value);
                }
            });
            $canvas.renderAll();
        });
        $("#deleteEditorboxBtn").click(function () {
            var activeElement = $canvas.getActiveObject();
            $canvas.remove(activeElement);
            $('#editbox').hide();
        });
        $("#persoFile").change(function () {
            window.location.href = '/?file=' + $("#persoFile").val();
        });
    };
    /**
     *
     * @returns {undefined}
     */
    var initCanvas = function () {
        $canvas.on("object:added", function (e) {
            switch (e.target.type) {
                case 'i-text':
                    var itext = e.target;
                    itext.on('moving', function () {
                        var data = this.toJSON();
                        _updateForm(data);
                    });
                    itext.on('rotating', function () {
                        var data = this.toJSON();
                        _updateForm(data);
                    });
                    itext.on('editing:exited', function () {
                        var data = this.toJSON();
                        _updateForm(data);
                    });
                    itext.on('selected', function () {
                        $('#editbox').show();
                        $('#editbox .txt').show();
                        var data = this.toJSON();
                        _updateForm(data);
                    });
                    break;
            }
        });
        $canvas.on("selection:cleared", function (e) {
            $('#editbox').hide();
        });
        $canvas.on("object:moving", function (e) {
            var obj = e.target;
            var halfw = obj.getWidth() / 2;
            var halfh = obj.getHeight() / 2;
            var bounds = {
                tl: {x: halfw, y: halfh},
                br: {x: obj.canvas.getWidth(), y: obj.canvas.getHeight()}
            };
            // top-left  corner
            if (obj.top < bounds.tl.y || obj.left < bounds.tl.x) {
                obj.top = Math.max(obj.top, 0);
                obj.left = Math.max(obj.left, 0);
            }
            // bot-right corner
            if (obj.top + obj.getHeight() > bounds.br.y || obj.left + obj.getWidth() > bounds.br.x) {
                obj.top = Math.min(obj.top, $canvas.getHeight() - obj.getHeight());
                obj.left = Math.min(obj.left, $canvas.getWidth() - obj.getWidth());
            }
        });
    };
    var initBase64 = function () {
        if ($('#base64')) {
            var url = '/data/perso/' + $('#base64').data('template');
            $.getJSON(url, function (data) {
                $canvas.loadFromJSON(data, function () {
                    $canvas.renderAll();
                    $('#base64').text($canvas.toDataURL('png'));
                });
            });
        }
    };
    /**
     *
     * @returns {undefined}
     */
    var init = function () {
        initCanvas();
        initToolbox();
        initBtn();
        initBase64();
    };
    return {
        init: init
    };
})(jQuery, _, fabric);
/**
 *
 * @param {type} param
 */
jQuery(document).ready(function () {
    WeezPdfEngine.init();
});





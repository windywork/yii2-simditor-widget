<?php

/**
 * @link https://github.com/FrankLee33/yii2-simditor-widget
 * @link http://simditor.tower.im/
 */
namespace felix33\simditor;

use Yii;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\web\View;
use yii\widgets\InputWidget;

class Simditor extends InputWidget
{
    //配置选项
    public $clientOptions = [];

    //默认配置
    protected $_options;

    /**
     * @throws \yii\base\InvalidConfigException
     */
    public function init()
    {
        if (isset($this->options['id'])) {
            $this->id = $this->options['id'];
        } else {
            $this->id = $this->hasModel() ? Html::getInputId($this->model,
                $this->attribute) : $this->id;
        }
        $this->_options = [
          /* 'toolbar' => [ 'title', '|', 'bold', 'italic',
             'underline', 'strikethrough', 'color', 'fontScale',
             'clearhtml', '|', 'ol', 'ul', 'blockquote', 'code',
             'table', '|', 'link', 'image', 'hr', '|', 'indent',
             'outdent', 'alignment', 'html', 'fullscreen', 'devices'
           ]
           */
        ];
        $this->clientOptions = ArrayHelper::merge($this->_options, $this->clientOptions);
        parent::init();
    }

    public function run()
    {
        $this->registerClientScript();
        if ($this->hasModel()) {
            return Html::activeTextarea($this->model, $this->attribute, ['id' => $this->id]);
        } else {
            return Html::textarea($this->id, $this->value, ['id' => $this->id]);
        }
    }

    /**
     * 注册客户端脚本
     */
    protected function registerClientScript()
    {
        SimditorAsset::register($this->view);
        $clientOptions = Json::encode($this->clientOptions);
        $script = "(function (){ var config =". $clientOptions . "; ".
        " config['textarea'] = $('#".$this->id."'); ".
        " new window.Simditor(config);})();";
        $this->view->registerJs($script, View::POS_READY);
    }
}

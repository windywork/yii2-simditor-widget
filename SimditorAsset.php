<?php
namespace felix33\simditor;


use yii\web\AssetBundle;

class SimditorAsset extends AssetBundle
{
    public $css = [
        'simditor/styles/simditor.css',
        'simditor/styles/simditor-html.css',
        'simditor/styles/simditor-fullscreen.css',
        'simditor/styles/icons.css'
    ];

    public $js = [
      'simditor/scripts/jquery.min.js',
      'simditor/scripts/module.js',
      'simditor/scripts/hotkeys.js',
      'simditor/scripts/uploader.js',
      'simditor/scripts/beautify-html.js',
      'simditor/scripts/simditor.js',
      'simditor/scripts/simditor-html.js',
      'simditor/scripts/simditor-fullscreen.js',
      'simditor/scripts/simditor-clearhtml.js'
    ];

    public function init()
    {
        $this->sourcePath = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'assets';
    }
}

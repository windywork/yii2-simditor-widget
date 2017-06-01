Yii2 Simditor
===========
### 安装

```
$ php composer.phar require felix33/yii2-simditor "*"
```

or add

```
"felix33/yii2-simditor": "*"
```

to the ```require``` section of your `composer.json` file.

### 应用

view:  

```php
echo \felix33\simditor\Simditor::widget(['name' => 'xxxx']);
```

或者：

```php
echo $form->field($model,'colum')->widget('felix33\simditor\Simditor',[]);
```

### 配置相关

##### 编辑器相关配置，请在`view` 中配置，参数为`clientOptions`，比如定制菜单，编辑器大小等等，具体参数请查看[simditor官网文档](http://simditor.tower.im/docs/doc-usage.html)。

简单实例:  
```php
use \felix33\simditor\Simditor;
echo Simditor::widget([
    'name'=> 'simditor',
    'value'=> '初始化内容..',
    'clientOptions' => [
      'placeHolder' => '这里输入内容...',
      'toolbarFloat' => false,
       // 工具栏
      'toolbar' => [ 'title', '|', 'bold', 'italic',
          'underline', 'strikethrough', 'color',
          'fontScale', 'clearhtml', '|', 'ol', 'ul',
          'blockquote', 'code', 'table', '|', 'link',
          'image', 'hr', '|', 'indent', 'outdent',
          'alignment', 'html', 'fullscreen', 'devices'
       ],
        // 编辑器插入图片时使用的默认图片
       'defaultImage' => '/images/image.png',
       'upload' => [
          // 文件上传的接口地址
          'url' => Url::toRoute(['upload']),
          // 键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
          'params' => null,
          // 服务器端获取文件数据的参数名
          'fileKey' => 'fileData',
          'connectionCount' => 3,
          'leaveConfirm' => '正在上传文件'
        ]
    ]);
```

##### 文件上传相关配置，请在`controller`中配置

简单实例:  
controller:  

```php
public function actions()
{
    return [
        'upload' => [
            'class' => 'felix33\simditor\SimditorAction'
        ]
    ];
}
```
或者：

```php
public function actions()
{
    return [
        'upload' => [
            'class' => 'felix33\simditor\SimditorAction',
            'config' => [
                // 文件字段
                "fileKey" => "fileData",
                // 图片访问路径前缀
                "urlPrefix"  => Yii::getAlias('@web'),
                // 上传保存路径
                "uploadRoot" => Yii::getAlias("@webroot"),
                // 上传路径格式化
                "pathFormat" => "/upload/{yyyy}{mm}{dd}/{time}{rand:6}"
            ],
        ]
    ];
}
```

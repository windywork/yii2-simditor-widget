<?php
namespace felix33\simditor;
use Yii;
use yii\base\Action;
use yii\helpers\ArrayHelper;
use yii\web\Response;
class SimditorAction extends Action
{
    /**
     * @var array
     */
    public $config = [];

    private $stateMap = array( // 上传状态映射表
        "UPLOAD_SUCCESS" => "上传成功",
        "ERROR_TMP_FILE"           => "临时文件错误",
        "ERROR_TMP_FILE_NOT_FOUND" => "找不到临时文件",
        "ERROR_SIZE_EXCEED"        => "文件大小超出网站限制",
        "ERROR_TYPE_NOT_ALLOWED"   => "文件类型不允许",
        "ERROR_CREATE_DIR"         => "目录创建失败",
        "ERROR_DIR_NOT_WRITEABLE"  => "目录没有写权限",
        "ERROR_FILE_MOVE"          => "文件保存时出错",
        "ERROR_FILE_NOT_FOUND"     => "找不到上传文件",
        "ERROR_WRITE_CONTENT"      => "写入文件内容错误",
        "ERROR_UNKNOWN"            => "未知错误",
        "ERROR_DEAD_LINK"          => "链接不可用",
        "ERROR_HTTP_LINK"          => "链接不是http链接",
        "ERROR_HTTP_CONTENTTYPE"   => "链接contentType不正确"
    );

    public function init()
    {
        //close csrf
        Yii::$app->request->enableCsrfValidation = false;
        $_config['urlPrefix'] = Yii::getAlias('@web');
        // 添加图片默认root路径；
        $_config['uploadRoot'] = Yii::getAlias('@webroot');
        $_config['fileKey'] = 'fileData';
        $_config['pathFormat'] = '/upload/image/{yyyy}{mm}{dd}/{time}{rand:6}';
        //load config file
        $this->config = ArrayHelper::merge($_config, $this->config);
        parent::init();
    }
    public function run()
    {
        if (Yii::$app->request->get('callback',false)) {
            Yii::$app->response->format = Response::FORMAT_JSONP;
        } else {
            Yii::$app->response->format = Response::FORMAT_JSON;
        }
        return $this->handleAction();
    }
    /**
     * 处理action
     */
    protected function handleAction()
    {
        $result = $this->actionUpload();
        // 处理返回的URL
        if (substr($result['file_path'], 0, 1) != '/') {
            $result['file_path'] = '/' . $result['file_path'];
        }
        $result['file_path'] = $this->config['urlPrefix'].$result['file_path'];
        // 输出结果
        return $result;
    }

    // 获得全名
    private function getFullname ($oriName, $fileExt) {
      // 替换日期事件
      $t = time();
      $d = explode('-', date("Y-y-m-d-H-i-s"));
      $format = $this->config["pathFormat"];
      $format = str_replace("{yyyy}", $d[0], $format);
      $format = str_replace("{yy}", $d[1], $format);
      $format = str_replace("{mm}", $d[2], $format);
      $format = str_replace("{dd}", $d[3], $format);
      $format = str_replace("{hh}", $d[4], $format);
      $format = str_replace("{ii}", $d[5], $format);
      $format = str_replace("{ss}", $d[6], $format);
      $format = str_replace("{time}", $t, $format);
      // 过滤文件名的非法自负,并替换文件名
      $oriName = substr($oriName, 0, strrpos($oriName, '.'));
      $oriName = preg_replace("/[\|\?\"\<\>\/\*\\\\]+/", '', $oriName);
      $format = str_replace("{filename}", $oriName, $format);
      // 替换随机字符串
      $randNum = mt_rand(1, 1000000000) . mt_rand(1, 1000000000);
      if (preg_match("/\{rand\:([\d]*)\}/i", $format, $matches)) {
          $format = preg_replace("/\{rand\:[\d]*\}/i", substr($randNum, 0, $matches[1]), $format);
      }
      return  $format . $fileExt;
    }
    /**
     * 上传
     * @return array
     */
    protected function actionUpload()
    {
        $file = $_FILES[$this->config['fileKey']];
        $oriName = $file['name'];
        $fileExt = strtolower(strrchr($oriName, '.'));
        $fullName = $this->getFullname($oriName, $fileExt);
        $uploadRoot = ArrayHelper::getValue($this->config, "uploadRoot", $_SERVER['DOCUMENT_ROOT']);
        $filePath = $uploadRoot.(substr($fullName, 0, 1) != '/'?'/':'').$fullName;
        $fileName = substr($filePath, strrpos($filePath, '/') + 1);
        $dirName = dirname($filePath);
        $err = null;
        // create dir
        if (!file_exists($dirName) && !mkdir($dirName, 0777, true)) {
            $err = $this->stateMap["ERROR_CREATE_DIR"];
        } else if (!is_writeable($dirName)) {
            $err = $this->stateMap["ERROR_DIR_NOT_WRITEABLE"];
        }
        // move file
        if (!$err && (move_uploaded_file($file["tmp_name"], $filePath) && file_exists($filePath))) {
            $err = null;
        } else if (!$err) {
            $err = $this->stateMap["ERROR_FILE_MOVE"];
        }
        return [
          'success'=> !$err,
          'msg'=> $err ? $err: $this->stateMap["UPLOAD_SUCCESS"],
          'file_path'=> $fullName
        ];
    }
}

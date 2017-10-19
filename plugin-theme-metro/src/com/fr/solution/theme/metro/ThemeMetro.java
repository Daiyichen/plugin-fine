package com.fr.solution.theme.metro;

import com.fr.fs.fun.impl.AbstractThemeVariousProvider;
import com.fr.plugin.ExtraClassManager;
import com.fr.plugin.PluginLicense;
import com.fr.plugin.PluginLicenseManager;
import com.fr.stable.fun.Authorize;
import com.fr.stable.fun.FunctionHelper;
import com.fr.stable.fun.FunctionProcessor;
import com.fr.stable.fun.impl.AbstractFunctionProcessor;

/**
 * Created by icy on 16/9/14.
 */
@Authorize(callSignKey = Constants.PLUGIN_ID)
public class ThemeMetro extends AbstractThemeVariousProvider {


	public static final FunctionProcessor ONEFUNCTION = new AbstractFunctionProcessor(){
	    //插件的id，传入pluginID，如com.fr.plugin.MultiLevelReport
	    @Override
	    public int getId(){
	        int id = FunctionHelper.generateFunctionID(Constants.PLUGIN_ID);
	        return id;
	    }
	    //插件的名字
	    @Override
	    public String getLocaleKey() {
	        return "plugin-theme-metro";//使用国际化的时候直接返回国际化字符串即可
	    }
	};

    @Override
    public String name() {
    	PluginLicense pluginLicense = PluginLicenseManager.getInstance().getPluginLicenseByID(Constants.PLUGIN_ID);
        if (pluginLicense.isAvailable()) {
            return "Metro";
        } else {
            return "";
        }
       
    }

    @Override
    public String text() {      
        PluginLicense pluginLicense = PluginLicenseManager.getInstance().getPluginLicenseByID(Constants.PLUGIN_ID);
        if (pluginLicense.isAvailable()) {
            return "metro";
        } else {
            return "";
        }
    }

    @Override
    public String coverPath() {
    	 PluginLicense pluginLicense = PluginLicenseManager.getInstance().getPluginLicenseByID(Constants.PLUGIN_ID);
        if (pluginLicense.isAvailable()) {
          	return "/com/fr/solution/theme/metro/files/cover.png";
        } else {
            return "";
        }
        
    }

    @Override
    public String scriptPath() {
    	FunctionProcessor processor = ExtraClassManager.getInstance().getFunctionProcessor();
		if(processor!=null){
	    	processor.recordFunction(ONEFUNCTION);
		}
        PluginLicense pluginLicense = PluginLicenseManager.getInstance().getPluginLicenseByID(Constants.PLUGIN_ID);
        if (pluginLicense.isAvailable()) {
            return "/com/fr/solution/theme/metro/files/theme.js";
        } else {
            return "";
        }
    }

    @Override
    public String stylePath() {
        PluginLicense pluginLicense = PluginLicenseManager.getInstance().getPluginLicenseByID(Constants.PLUGIN_ID);
        if (pluginLicense.isAvailable()) {
            return "/com/fr/solution/theme/metro/files/style.css";
        } else {
            return "";
        }
    }
}

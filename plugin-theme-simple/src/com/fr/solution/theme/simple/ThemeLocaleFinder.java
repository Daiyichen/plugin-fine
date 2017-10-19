package com.fr.solution.theme.simple;

import com.fr.stable.fun.impl.AbstractLocaleFinder;

/**
 * Created by richie on 2016/10/24.
 */
public class ThemeLocaleFinder extends AbstractLocaleFinder {
    @Override
    public String find() {
        return "com/fr/solution/theme/simple/locale/theme";
    }
}
